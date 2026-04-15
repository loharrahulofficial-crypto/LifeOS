import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIResponse, PROMPTS } from '../utils/aiClient';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getToday, formatDisplayDate, getLastNDays } from '../utils/dateUtils';

export default function AICoach({ habits, completions, isCompleted, getTotals, getItems, addHabit }) {
  const [apiKey, setApiKey] = useLocalStorage('lifeos-anthropic-key', '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseType, setResponseType] = useState('');
  const [error, setError] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const today = getToday();

  const getTodayHabitSummary = () => {
    if (habits.length === 0) return 'No habits tracked yet.';
    const dayData = completions[today] || {};
    return habits.map(h => `${h.emoji} ${h.name}: ${dayData[h.id] ? '✅ Done' : '❌ Not done'}`).join('\n');
  };

  const getTodayNutritionSummary = () => {
    const totals = getTotals(today);
    if (totals.calories === 0 && totals.protein === 0) return 'No nutrition data logged today.';
    return `Calories: ${totals.calories}, Protein: ${totals.protein}g, Carbs: ${totals.carbs}g, Fat: ${totals.fat}g, Fiber: ${totals.fiber}g, Water: ${totals.water} glasses`;
  };

  const getWeeklyData = () => {
    const days = getLastNDays(7);
    return days.map(d => {
      const dayData = completions[d] || {};
      const habitStatus = habits.map(h => `${h.emoji}${dayData[h.id] ? '✅' : '❌'}`).join(' ');
      const totals = getTotals(d);
      return `${formatDisplayDate(d)}: Habits: ${habitStatus} | Cal: ${totals.calories}, P: ${totals.protein}g`;
    }).join('\n');
  };

  const handleRequest = async (type) => {
    if (!apiKey) {
      setShowKeyInput(true);
      setError('Please enter your Anthropic API key first.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setResponseType(type);

    try {
      let result;
      if (type === 'daily') {
        const prompt = PROMPTS.dailyCoach;
        result = await getAIResponse(
          apiKey, prompt.system,
          prompt.template(getTodayHabitSummary(), getTodayNutritionSummary())
        );
      } else if (type === 'weekly') {
        const prompt = PROMPTS.weeklyReview;
        result = await getAIResponse(apiKey, prompt.system, prompt.template(getWeeklyData()));
      } else if (type === 'suggest') {
        if (!goalInput.trim()) {
          setError('Please describe your goal first.');
          setLoading(false);
          return;
        }
        const prompt = PROMPTS.habitSuggestions;
        result = await getAIResponse(apiKey, prompt.system, prompt.template(goalInput));
      }
      setResponse(result);
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${'•'.repeat(20)}${apiKey.slice(-4)}` : '';

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
        🤖 AI Coach
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Powered by Claude — get personalized insights from your data.
      </p>

      {/* API Key Section */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>🔑 API Key</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {apiKey ? maskedKey : 'No key set — enter your Anthropic API key'}
            </p>
          </div>
          <motion.button
            className="btn-secondary"
            onClick={() => setShowKeyInput(!showKeyInput)}
            whileTap={{ scale: 0.95 }}
          >
            {showKeyInput ? 'Hide' : apiKey ? 'Change' : 'Set Key'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: '0.75rem' }}
            >
              <input
                className="input-field"
                type="password"
                placeholder="sk-ant-api..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
                id="api-key-input"
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                🔒 Your key is stored locally in your browser only. Never sent anywhere except Anthropic's API.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <motion.button
          className="card"
          onClick={() => handleRequest('daily')}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          style={{ cursor: loading ? 'wait' : 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
        >
          <p style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>🌅</p>
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Daily Coach</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Get today's personalized insight
          </p>
        </motion.button>

        <motion.button
          className="card"
          onClick={() => handleRequest('weekly')}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          style={{ cursor: loading ? 'wait' : 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
        >
          <p style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>📅</p>
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Weekly Review</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Summarize your 7-day progress
          </p>
        </motion.button>
      </div>

      {/* Habit Suggestion Engine */}
      <div className="card-no-hover" style={{ marginBottom: '1rem' }}>
        <p className="section-title">💡 Habit Suggestion Engine</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Describe your goal and Claude will suggest 5 tailored habits.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            className="input-field"
            placeholder="I want to get healthier, be more productive, learn guitar..."
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRequest('suggest')}
            style={{ flex: 1, minWidth: '200px' }}
            id="goal-input"
          />
          <motion.button
            className="btn-primary"
            onClick={() => handleRequest('suggest')}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            ✨ Suggest
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="card-no-hover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ marginBottom: '1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ fontSize: '1.3rem' }}
              >
                ⏳
              </motion.div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Claude is thinking...</p>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="skeleton" style={{ height: 12, width: i === 2 ? 80 : 150, borderRadius: 6 }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-no-hover"
          style={{ marginBottom: '1rem', background: 'var(--danger-bg)', borderColor: 'var(--danger)' }}
        >
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 500 }}>⚠️ {error}</p>
        </motion.div>
      )}

      {/* Response */}
      <AnimatePresence>
        {response && !loading && (
          <motion.div
            className="card-no-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ borderLeft: '3px solid var(--accent)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem' }}>
                {responseType === 'daily' ? '🌅' : responseType === 'weekly' ? '📅' : '💡'}
              </span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {responseType === 'daily' ? 'Daily Insight' : responseType === 'weekly' ? 'Weekly Review' : 'Suggested Habits'}
              </p>
            </div>
            <div style={{
              fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
            }}>
              {response}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
