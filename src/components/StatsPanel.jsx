import { useMemo, memo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { getDayName } from '../utils/dateUtils';
import { motion } from 'motion/react';

const StatsPanel = memo(function StatsPanel({ habits, getWeeklyStats, getMonthlyStats, getStreak, getLongestStreak, getTotalCompletions }) {
  const weeklyStats = useMemo(() => getWeeklyStats(), [getWeeklyStats]);
  const monthlyStats = useMemo(() => getMonthlyStats(), [getMonthlyStats]);
  const totalCompleted = useMemo(() => getTotalCompletions(), [getTotalCompletions]);

  const weeklyChartData = weeklyStats.map(d => ({
    day: getDayName(d.date),
    completed: d.completed,
    total: d.total,
  }));

  const monthlyChartData = monthlyStats.map((d, i) => ({
    day: i + 1,
    rate: d.rate,
  }));

  const streakLeaderboard = useMemo(() => {
    return habits
      .map(h => ({
        ...h,
        streak: getStreak(h.id),
        longestStreak: getLongestStreak(h.id),
      }))
      .sort((a, b) => b.streak - a.streak);
  }, [habits, getStreak, getLongestStreak]);

  const todayRate = weeklyStats.length > 0 ? weeklyStats[weeklyStats.length - 1].rate : 0;
  const bestStreak = streakLeaderboard.length > 0 ? streakLeaderboard[0].streak : 0;

  return (
    <div className="tab-animate" style={{ width: '100%', overflowX: 'hidden' }}>
      <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 0 10px var(--accent)', borderLeft: '4px solid var(--accent)', paddingLeft: '0.5rem', marginBottom: '1.5rem' }}>
        SYSTEM ANALYTICS
      </h2>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}
      >
        {[
          { label: 'TODAY\'S RATE', value: `${todayRate}%`, icon: '📈', color: '#06b6d4' },
          { label: 'BEST STREAK', value: `${bestStreak} days`, icon: '🔥', color: '#ef4444' },
          { label: 'ACTIVE HABITS', value: habits.length, icon: '🎯', color: '#10b981' },
          { label: 'TOTAL DONE', value: totalCompleted, icon: '⚡', color: '#8b5cf6' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 + 0.1 }}
            className="card-no-hover"
            style={{ 
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: 0, clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              border: `1px solid ${card.color}40`, boxShadow: `0 0 15px ${card.color}20`, background: `linear-gradient(145deg, var(--bg-card), ${card.color}15)`
            }}
          >
            <p style={{ fontSize: '1.6rem', marginBottom: '0.25rem', filter: `drop-shadow(0 0 10px ${card.color})` }}>{card.icon}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: card.color, textShadow: `0 0 12px ${card.color}80` }}>
              {card.value}
            </p>
            <p style={{ fontSize: '0.65rem', color: card.color, fontWeight: 800, letterSpacing: '0.1em' }}>{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {habits.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</p>
          <p style={{ color: 'var(--text-muted)' }}>Add some habits to see your stats!</p>
        </div>
      )}

      {habits.length > 0 && (
        <>
          {/* Weekly Bar Chart */}
          {/* Weekly Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-no-hover" style={{ 
            marginBottom: '1rem', overflow: 'hidden', borderRadius: 0,
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
            border: '1px solid #06b6d440', background: 'linear-gradient(135deg, var(--bg-card), #06b6d410)', boxShadow: '0 0 20px #06b6d415'
          }}>
            <p className="section-title" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 900, color: 'var(--accent)', textShadow: '0 0 8px #06b6d480' }}>📊 WEEKLY LOG</p>
            <div style={{ width: '100%', height: 220, overflow: 'hidden', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-input)' }}
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 14, fontSize: '0.8rem', fontWeight: 600,
                      color: 'var(--text-primary)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }}
                  />
                  <Bar dataKey="completed" fill="url(#barGradient)" radius={[6, 6, 6, 6]} name="Completed" barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Area Chart */}
          {/* Monthly Area Chart */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-no-hover" style={{ 
            marginBottom: '1rem', overflow: 'hidden', borderRadius: 0,
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
            border: '1px solid #10b98140', background: 'linear-gradient(135deg, var(--bg-card), #10b98110)', boxShadow: '0 0 20px #10b98115'
          }}>
            <p className="section-title" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 900, color: 'var(--success)', textShadow: '0 0 8px #10b98180' }}>📈 COMPLETION RATE</p>
            <div style={{ width: '100%', height: 220, overflow: 'hidden', marginTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" dx={-10} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 14, fontSize: '0.8rem', fontWeight: 600,
                      color: 'var(--text-primary)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }}
                    formatter={(val) => [`${val}%`, 'Completion']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--success)"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    activeDot={{ r: 6, fill: 'var(--success)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Streak Leaderboard */}
          {/* Streak Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-no-hover" style={{
            borderRadius: 0,
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
            border: '1px solid #06b6d440', background: 'linear-gradient(135deg, var(--bg-card), #06b6d410)', boxShadow: '0 0 20px #06b6d415'
          }}>
            <p className="section-title" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 900, color: 'var(--text-primary)', textShadow: '0 0 8px #06b6d480' }}>🏆 HALL OF HEROES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {streakLeaderboard.map((habit, i) => (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 0.85rem', borderRadius: 14,
                    background: i === 0 && habit.streak > 0 ? 'var(--accent-subtle)' : 'var(--bg-input)',
                    border: i === 0 && habit.streak > 0 ? '1px solid var(--accent)' : '1px solid transparent',
                    boxShadow: i === 0 && habit.streak > 0 ? `0 4px 15px #06b6d420` : 'none',
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? 'var(--bg-card)' : 'var(--bg-card)', fontWeight: 800, fontSize: '0.9rem',
                    color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                    boxShadow: i === 0 ? `0 2px 8px #06b6d430` : 'none',
                  }}>
                    {i === 0 ? '👑' : `#${i + 1}`}
                  </span>
                  <span style={{ fontSize: '1.3rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{habit.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{habit.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best: {habit.longestStreak} days</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: habit.streak > 0 ? 'var(--accent)' : 'var(--text-muted)', fontSize: '1.15rem' }}>
                      🔥 {habit.streak}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>days</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
});

export default StatsPanel;
