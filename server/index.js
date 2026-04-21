require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');
const { OAuth2Client } = require('google-auth-library');

const app  = express();
const PORT = process.env.PORT || 4000;

// Initialize Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ── DB Pool ───────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'lifeos_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('👉 Make sure MySQL is running and your .env is configured correctly.');
  });

// ── Auto-create tables if missing ──────────────────────────────
async function ensureTables() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      uid          VARCHAR(128) PRIMARY KEY,
      email        VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      photo_url    VARCHAR(512),
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_data (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    VARCHAR(128) NOT NULL,
      module     VARCHAR(50)  NOT NULL,
      payload    JSON         NOT NULL,
      updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_module (user_id, module),
      FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ Database tables ready');
}
ensureTables().catch(err => console.error('Table creation failed:', err.message));

// ── Firebase Auth Middleware ─────────────────────────────────
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    // Payload contains standard Google info: sub (uid), email, name, picture
    const uid = payload.sub;
    
    // Upsert user into database to ensure foreign key works
    await pool.execute(
      `INSERT INTO users (uid, email, display_name, photo_url)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         email = VALUES(email), 
         display_name = VALUES(display_name), 
         photo_url = VALUES(photo_url),
         last_login = CURRENT_TIMESTAMP`,
      [uid, payload.email || '', payload.name || '', payload.picture || '']
    );

    req.userId = uid;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ══════════════════════════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════════════════════════

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Apply auth middleware to all /data routes
app.use('/data', verifyToken);

// ── GET /data/:module  →  load one module ─────────────────────
app.get('/data/:module', async (req, res) => {
  const { module } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT payload, updated_at FROM app_data WHERE user_id = ? AND module = ?',
      [req.userId, module]
    );
    if (rows.length === 0) return res.json({ payload: null });
    res.json({ payload: rows[0].payload, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error('GET /data error:', err);
    res.status(500).json({ error: 'Database read failed' });
  }
});

// ── GET /data  →  load ALL modules for a user ───────────────
app.get('/data', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT module, payload, updated_at FROM app_data WHERE user_id = ?',
      [req.userId]
    );
    const result = {};
    rows.forEach(r => { result[r.module] = { payload: r.payload, updated_at: r.updated_at }; });
    res.json(result);
  } catch (err) {
    console.error('GET /data (all) error:', err);
    res.status(500).json({ error: 'Database read failed' });
  }
});

// ── PUT /data/:module  →  save / upsert one module ────────────
app.put('/data/:module', async (req, res) => {
  const { module } = req.params;
  const { payload } = req.body;

  if (payload === undefined) {
    return res.status(400).json({ error: 'Missing payload in request body' });
  }

  try {
    await pool.execute(
      `INSERT INTO app_data (user_id, module, payload)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = CURRENT_TIMESTAMP`,
      [req.userId, module, JSON.stringify(payload)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /data error:', err);
    res.status(500).json({ error: 'Database write failed' });
  }
});

// ── POST /data/bulk  →  save multiple modules at once ─────────
app.post('/data/bulk', async (req, res) => {
  const { modules } = req.body; // { habits: {...}, gym: {...}, ... }

  if (!modules || typeof modules !== 'object') {
    return res.status(400).json({ error: 'Missing modules object in body' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const [mod, payload] of Object.entries(modules)) {
      await conn.execute(
        `INSERT INTO app_data (user_id, module, payload)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE payload = VALUES(payload), updated_at = CURRENT_TIMESTAMP`,
        [req.userId, mod, JSON.stringify(payload)]
      );
    }
    await conn.commit();
    res.json({ success: true, saved: Object.keys(modules) });
  } catch (err) {
    await conn.rollback();
    console.error('POST /data/bulk error:', err);
    res.status(500).json({ error: 'Bulk write failed' });
  } finally {
    conn.release();
  }
});

// ── DELETE /data/:module  →  clear one module ─────────────────
app.delete('/data/:module', async (req, res) => {
  const { module } = req.params;

  try {
    await pool.execute(
      'DELETE FROM app_data WHERE user_id = ? AND module = ?',
      [req.userId, module]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /data error:', err);
    res.status(500).json({ error: 'Database delete failed' });
  }
});

// ── DELETE /data  →  wipe all data for a user ───────────────
app.delete('/data', async (req, res) => {
  try {
    await pool.execute('DELETE FROM app_data WHERE user_id = ?', [req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /data (all) error:', err);
    res.status(500).json({ error: 'Database wipe failed' });
  }
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 LifeOS API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});
