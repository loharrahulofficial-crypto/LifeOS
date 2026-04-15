import { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDayName } from '../utils/dateUtils';

export default function StatsPanel({ habits, getWeeklyStats, getMonthlyStats, getStreak, getLongestStreak, getTotalCompletions }) {
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
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
        📊 Stats & Analytics
      </h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'TODAY\'S RATE', value: `${todayRate}%`, icon: '📈', color: 'var(--accent)' },
          { label: 'BEST STREAK', value: `${bestStreak} days`, icon: '🔥', color: '#ef4444' },
          { label: 'ACTIVE HABITS', value: habits.length, icon: '🎯', color: 'var(--success)' },
          { label: 'TOTAL DONE', value: totalCompleted, icon: '⚡', color: '#8b5cf6' },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="card-no-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{card.icon}</p>
            <motion.p
              style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color }}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 + 0.2, type: 'spring', stiffness: 200 }}
            >
              {card.value}
            </motion.p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {habits.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</p>
          <p style={{ color: 'var(--text-muted)' }}>Add some habits to see your stats!</p>
        </div>
      )}

      {habits.length > 0 && (
        <>
          {/* Weekly Bar Chart */}
          <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
            <p className="section-title">📊 Weekly Habits Completed</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={{ stroke: 'var(--border)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, fontFamily: 'DM Sans', fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="completed" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Line Chart */}
          <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
            <p className="section-title">📈 30-Day Completion Rate</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Sans' }} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={{ stroke: 'var(--border)' }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, fontFamily: 'DM Sans', fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                    }}
                    formatter={(val) => [`${val}%`, 'Completion']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'var(--accent)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Streak Leaderboard */}
          <div className="card-no-hover">
            <p className="section-title">🏆 Streak Leaderboard</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {streakLeaderboard.map((habit, i) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.85rem', borderRadius: 12,
                    background: i === 0 && habit.streak > 0 ? 'var(--accent-subtle)' : 'var(--bg-input)',
                    border: i === 0 && habit.streak > 0 ? '1px solid var(--accent)' : '1px solid transparent',
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-card)', fontWeight: 700, fontSize: '0.8rem',
                    color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                    {i === 0 ? '👑' : `#${i + 1}`}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{habit.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{habit.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best: {habit.longestStreak} days</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, color: habit.streak > 0 ? 'var(--accent)' : 'var(--text-muted)', fontSize: '1.1rem' }}>
                      🔥 {habit.streak}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>days</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
