import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIResponseStream, PROVIDER_OPTIONS, generateAiText } from '../utils/aiClient';
import { ZEROG_PHASES, buildZeroGSystemPrompt } from '../data/zeroG_manifest';
import ZeroGLabDashboard from './ZeroGLabDashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getToday } from '../utils/dateUtils';
import { playChime, playTick } from '../utils/audio';
import {
  speakFridayReply,
  stopFridaySpeech,
  getSpeechLang,
  ensureSpeechVoices,
  FRIDAY_VOICE_PRESETS,
} from '../utils/fridayTts';

function hapticTick(enabled) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(12);
  } catch {
    /* ignore */
  }
}

/** Short pulse when dictation arms — distinct from reply haptics. */
function hapticVoiceArm(enabled) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([16, 30, 12]);
  } catch {
    /* ignore */
  }
}

/** Center “face” for Assistant layout — animates while thinking, speaking (streaming), or listening. */
function FridayPresenceOrb({ speaking, thinking, listening }) {
  const mood = listening ? 'listening' : speaking ? 'speaking' : thinking ? 'thinking' : 'idle';
  const label =
    mood === 'listening'
      ? 'Listening'
      : mood === 'speaking'
        ? 'Speaking'
        : mood === 'thinking'
          ? 'Processing'
          : 'Ready';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
      <div style={{ position: 'relative', width: 168, height: 168, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {thinking && (
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid color-mix(in srgb, var(--accent) 35%, transparent)',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
          />
        )}
        {speaking && (
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.85, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.25, ease: 'easeInOut' }}
          />
        )}
        {listening && (
          <motion.div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 65%)',
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          />
        )}
        <motion.div
          animate={
            mood === 'idle'
              ? { scale: [1, 1.02, 1] }
              : mood === 'speaking' || mood === 'listening'
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
          }
          transition={
            mood === 'idle'
              ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
              : mood === 'speaking' || mood === 'listening'
                ? { repeat: Infinity, duration: 1.15, ease: 'easeInOut' }
                : { duration: 0.2 }
          }
          style={{
            width: 118,
            height: 118,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--accent) 55%, transparent), color-mix(in srgb, var(--accent) 12%, transparent))',
            border: '1px solid color-mix(in srgb, var(--accent) 50%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            boxShadow: '0 0 28px color-mix(in srgb, var(--accent) 32%, transparent)',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="8" opacity="0.35" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
          </svg>
        </motion.div>
      </div>
      <span
        style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Injected after LAYER A header — defines professional vs informal behaviour. */
function buildInteractionRegister(tone, address) {
  const a = address || 'Sir';
  if (tone === 'professional') {
    return `## INTERACTION REGISTER — professional
- Default to **clear, structured language** suited to work and serious planning: crisp sentences, logical flow, neutral professionalism with human warmth.
- Address "${a}" unless the user asks for something else.
- Avoid slang, meme phrasing, and empty hype. Contractions are fine when they sound natural.
- Aim for **executive-assistant calibre**: competent and approachable, never robotic or cold.`;
  }
  if (tone === 'relaxed') {
    return `## INTERACTION REGISTER — relaxed / informal
- Sound like a **sharp, friendly human**: natural contractions, plain English, conversational rhythm—you may be warm and informal while staying precise.
- Still use "${a}" by default; you may mirror casual "you" if the user clearly speaks that way in the thread.
- Light humour follows wit mode; never crude, and never flippant about health, safety, or someone's struggles.
- Do not add emoji to your own messages unless the user uses them first.`;
  }
  return `## INTERACTION REGISTER — adaptive (recommended)
- **Mirror the user's register.** Casual, short messages → reply in a natural, conversational way while staying accurate. Formal, technical, or work-focused messages → match that level of professionalism.
- If unclear, lean **slightly formal but approachable**—never stiff, never fake-cheerful.
- Default address "${a}"; mirror energy without copying typos, insults, or harmful content.
- Treat them as a real partner: notice when they need a plan vs reassurance vs a quick answer, and respond accordingly.`;
}

function speechErrorMessage(code) {
  const m = {
    'not-allowed': 'Microphone access denied — check site permissions in the browser.',
    aborted: '',
    'no-speech': 'No speech captured. Tap the mic and speak again.',
    'audio-capture': 'No usable microphone found.',
    /** Chromium uses a cloud backend; "network" often means a transient backend glitch, not your Wi‑Fi. */
    network:
      'Browser speech service failed after retries — not LifeOS servers. Try the mic again, disable VPN briefly, or type. On some networks or WebViews this feature is unreliable.',
    'service-not-allowed':
      'Speech blocked for this page — use HTTPS (or localhost), or try another browser.',
  };
  return m[code] ?? `Speech recognition error (${code}).`;
}

const VOICE_NETWORK_RETRIES = 3;
const voiceRetryDelayMs = (attempt) => 320 + attempt * 380;

// Lightweight markdown-to-JSX renderer for AI visual output
function renderMarkdown(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockLang = '';
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag key={`list-${elements.length}`} style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', lineHeight: 1.7 }}>
          {listItems.map((item, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{inlineFormat(item)}</li>)}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  // Inline formatting: bold, italic, code, links
  const inlineFormat = (str) => {
    const parts = [];
    // Process inline markdown with regex
    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.slice(lastIndex, match.index));
      }
      if (match[2]) { // ***bold italic***
        parts.push(<strong key={key++}><em>{match[2]}</em></strong>);
      } else if (match[3]) { // **bold**
        parts.push(<strong key={key++} style={{ color: 'var(--accent)', fontWeight: 800 }}>{match[3]}</strong>);
      } else if (match[4]) { // *italic*
        parts.push(<em key={key++} style={{ color: 'var(--text-secondary)' }}>{match[4]}</em>);
      } else if (match[5]) { // `inline code`
        parts.push(<code key={key++} style={{ background: 'var(--bg-input)', padding: '0.15rem 0.4rem', borderRadius: '6px', fontSize: '0.85em', fontFamily: 'monospace', border: '1px solid var(--border-light)', color: 'var(--accent)' }}>{match[5]}</code>);
      } else if (match[6] && match[7]) { // [text](url)
        parts.push(<a key={key++} href={match[7]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{match[6]}</a>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      parts.push(str.slice(lastIndex));
    }
    return parts.length > 0 ? parts : str;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trimStart().startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trimStart().slice(3).trim();
        codeBlockContent = '';
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={`code-${elements.length}`} style={{ margin: '0.75rem 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {codeBlockLang && <div style={{ background: 'var(--bg-input)', padding: '0.3rem 0.75rem', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)' }}>{codeBlockLang}</div>}
            <pre style={{ background: 'var(--bg-input)', padding: '0.85rem', overflowX: 'auto', margin: 0, fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              <code>{codeBlockContent}</code>
            </pre>
          </div>
        );
        codeBlockContent = '';
        codeBlockLang = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent += (codeBlockContent ? '\n' : '') + line;
      continue;
    }

    // Headers
    if (line.startsWith('### ')) { flushList(); elements.push(<h4 key={`h-${elements.length}`} style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', margin: '1rem 0 0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem' }}>{inlineFormat(line.slice(4))}</h4>); continue; }
    if (line.startsWith('## ')) { flushList(); elements.push(<h3 key={`h-${elements.length}`} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '1rem 0 0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem' }}>{inlineFormat(line.slice(3))}</h3>); continue; }
    if (line.startsWith('# ')) { flushList(); elements.push(<h2 key={`h-${elements.length}`} style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '1rem 0 0.5rem' }}>{inlineFormat(line.slice(2))}</h2>); continue; }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) { flushList(); elements.push(<hr key={`hr-${elements.length}`} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' }} />); continue; }

    // Unordered list
    if (/^\s*[-*•]\s/.test(line)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(line.replace(/^\s*[-*•]\s/, ''));
      continue;
    }

    // Ordered list
    if (/^\s*\d+[.)]\s/.test(line)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(line.replace(/^\s*\d+[.)]\s/, ''));
      continue;
    }

    // Empty line
    if (line.trim() === '') { flushList(); elements.push(<div key={`br-${elements.length}`} style={{ height: '0.5rem' }} />); continue; }

    // Normal paragraph
    flushList();
    elements.push(<p key={`p-${elements.length}`} style={{ margin: '0.25rem 0', lineHeight: 1.7 }}>{inlineFormat(line)}</p>);
  }

  flushList();
  return elements;
}

const MemoizedMarkdown = ({ content }) => {
  const rendered = useMemo(() => renderMarkdown(content), [content]);
  return <>{rendered}</>;
};

/** Pure chit-chat with no data question — avoids sending the manifest so models cannot "helpfully" dump stats. */
function normalizeChitChat(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[!?.…,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(well|so|um|uh)\s+/i, '');
}

function stripAssistantNameTokens(text) {
  return normalizeChitChat(text)
    .replace(/\bf\.r\.i\.d\.a\.y\.?\b/gi, ' ')
    .replace(/\bfriday\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip honorifics so "hello boss" matches the greeting set. */
function normalizeChitChatForMatch(text) {
  return stripAssistantNameTokens(text)
    .replace(/\b(sir|boss|ma'am|madam|miss)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeDataQuestion(text) {
  return /\b(habits?|nutrition|calorie|macros?|protein|carbs?|fat|meal|logged|\blog\b|stats|progress|workout|gym|tasks?|bulk|cut|diet|weight|steps|manifest|data|intake|deficit|surplus)\b/i.test(text);
}

function isFridayChitChatOnly(text) {
  if (looksLikeDataQuestion(text)) return false;
  const raw = normalizeChitChat(text);
  if (!raw || raw.includes('\n')) return false;
  const t = normalizeChitChatForMatch(text);
  if (!t) {
    return /\bfriday\b/i.test(text) || /f\.r\.i\.d\.a\.y\./i.test(text);
  }
  const words = t.split(/\s+/);
  if (words.length > 6) return false;
  const exact = new Set([
    'hi', 'hey', 'hello', 'hiya', 'yo', 'sup', 'howdy', 'gm', 'gn',
    'hi there', 'hey there', 'hello there',
    'good morning', 'good afternoon', 'good evening', 'good night', 'good day',
    'thanks', 'thank you', 'thx', 'ty', 'cheers', 'ta',
    'ok', 'okay', 'k', 'roger', 'copy',
    'bye', 'goodbye', 'see you', 'see ya', 'cya',
    'status', 'status check', 'systems check', 'systems', 'system status',
    'you there', 'are you there', 'anyone there', 'ping',
  ]);
  return exact.has(t);
}

function fridayChitChatReply(text, address, tone) {
  const addr = address || 'Sir';
  const reg = tone || 'adaptive';
  const stripped = stripAssistantNameTokens(text);
  if (!stripped && (/\bfriday\b/i.test(text) || /f\.r\.i\.d\.a\.y\./i.test(text))) {
    if (reg === 'relaxed') return `Here—what do you need, ${addr}?`;
    if (reg === 'professional') return `At your service, ${addr}. How may I help?`;
    return `At your service, ${addr}.`;
  }
  const t = normalizeChitChatForMatch(text) || normalizeChitChat(text);
  if (/^(bye|goodbye|see you|see ya|cya)\b/.test(t)) {
    if (reg === 'relaxed') return `Take care, ${addr}.`;
    return `Goodbye, ${addr}.`;
  }
  if (/^(thanks|thank you|thx|ty|cheers|ta)\b/.test(t)) {
    if (reg === 'relaxed') return `Any time, ${addr}.`;
    if (reg === 'professional') return `You're welcome, ${addr}.`;
    return `My pleasure, ${addr}.`;
  }
  if (/^(ok|okay|k|roger|copy)\b/.test(t)) {
    if (reg === 'relaxed') return `Got it, ${addr}.`;
    if (reg === 'professional') return `Understood, ${addr}.`;
    return `Acknowledged, ${addr}.`;
  }
  if (/^(status|status check|systems check|systems|system status)\b/.test(t) || /^(ping)\b/.test(t)) {
    if (reg === 'relaxed') return `All good on my side, ${addr}.`;
    return `All primary systems nominal, ${addr}. Uplink steady.`;
  }
  if (/^(you there|are you there|anyone there)\b/.test(t)) {
    if (reg === 'relaxed') return `Yeah—I'm here, ${addr}.`;
    if (reg === 'professional') return `Present and ready, ${addr}.`;
    return `Present and attentive, ${addr}.`;
  }
  if (/^good (morning|afternoon|evening|night|day)\b/.test(t)) {
    const period = t.replace(/^good\s+/, '');
    if (reg === 'relaxed') return `Good ${period}, ${addr}. What's on your mind?`;
    if (reg === 'professional') return `Good ${period}, ${addr}. What would you like to work on?`;
    return `Good ${period}, ${addr}. How may I assist you?`;
  }
  const greetingsPro = [
    `Good day, ${addr}. What would you like to focus on?`,
    `Good day, ${addr}. How may I assist?`,
    `At your service, ${addr}.`,
    `Ready when you are, ${addr}.`,
  ];
  const greetingsRelax = [
    `Hey ${addr}—what can I do for you?`,
    `What's up, ${addr}?`,
    `I'm here, ${addr}.`,
    `Go ahead, ${addr}.`,
  ];
  const greetingsMix = [
    `Good day, ${addr}. How may I assist you?`,
    `At your service, ${addr}.`,
    `Good day, ${addr}.`,
    `Systems nominal, ${addr}. Awaiting instructions.`,
    `Online and ready, ${addr}.`,
    `Always a pleasure, ${addr}.`,
  ];
  const pool = reg === 'professional' ? greetingsPro : reg === 'relaxed' ? greetingsRelax : greetingsMix;
  const key = t || 'sir';
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

/** Short "open X" commands — switches LifeOS tab without calling the model. */
function parseNavigationIntent(text) {
  const t = text.trim().toLowerCase().replace(/\s+/g, ' ');
  if (/\?/.test(t)) return null;
  if (/\band\b|\bthen\b|\balso\b|\bwhat\b|\bhow\b|\bwhy\b|\bwhen\b|\btell\b|\bexplain\b|\banalyse|\banalyze\b/i.test(t)) return null;
  const openRe = /^(please\s+)?(open|go to|go|show|take me to|switch to|bring up)\s+/i;
  if (!openRe.test(t)) return null;
  let rest = t
    .replace(openRe, '')
    .replace(/^the\s+/i, '')
    .replace(/\s+tab$/i, '')
    .replace(/[.!?]+$/g, '')
    .trim();
  if (!rest || rest.split(/\s+/).length > 3) return null;
  if (/^dashboard|^home$/i.test(rest)) return 'dashboard';
  if (/^habit/i.test(rest)) return 'habits';
  if (/^task/i.test(rest)) return 'tasks';
  if (/^focus|^pomodoro/i.test(rest)) return 'pomodoro';
  if (/^nutrition|^diet|^food|^meal/i.test(rest)) return 'nutrition';
  if (/^gym|^workout|^gymos/i.test(rest)) return 'gym';
  if (/^stat/i.test(rest)) return 'stats';
  if (/^friday|^f\.r\.i\.d\.a\.y\.|^ai$/i.test(rest)) return 'ai';
  return null;
}

function fridayNavigateReply(tab, address, tone) {
  const addr = address || 'Sir';
  const reg = tone || 'adaptive';
  if (tab === 'ai') {
    if (reg === 'relaxed') return `You're already here, ${addr}. Want a different tab?`;
    if (reg === 'professional') return `You are already in this module, ${addr}. Shall I open another section?`;
    return `You are already on this channel, ${addr}. Shall I open another module?`;
  }
  const labels = {
    dashboard: 'Home',
    habits: 'Habits',
    tasks: 'Tasks',
    pomodoro: 'Focus',
    nutrition: 'Nutrition',
    gym: 'GymOS',
    stats: 'Stats',
  };
  const label = labels[tab];
  if (reg === 'relaxed') return `On it—opening ${label}, ${addr}.`;
  if (reg === 'professional') return `Opening ${label} now, ${addr}.`;
  return `Right away, ${addr}. Opening ${label}.`;
}

export default function AICoach({ habits, completions, getTotals, addHabit, setActiveTab, taskProps, pomodoroProps }) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useLocalStorage('lifeos-api-messages', []);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  // API Settings
  const [providerId, setProviderId] = useLocalStorage('lifeos-ai-provider', 'gemini');
  const [zeroGMission, setZeroGMission] = useLocalStorage('lifeos-zerog-mission', { active: false, phase: 1 });
  const [apiKey, setApiKey] = useLocalStorage('lifeos-ai-key', '');
  const [customModel, setCustomModel] = useLocalStorage('lifeos-ai-model', '');
  const [customUrl, setCustomUrl] = useLocalStorage('lifeos-ai-url', '');
  const [fridayAddress, setFridayAddress] = useLocalStorage('lifeos-friday-address', 'Boss');
  const [fridayVerbosity, setFridayVerbosity] = useLocalStorage('lifeos-friday-verbosity', 'balanced');
  const [fridayWit, setFridayWit] = useLocalStorage('lifeos-friday-wit', 'dry');
  const [fridayProactive, setFridayProactive] = useLocalStorage('lifeos-friday-proactive', 'on');
  const [fridayTone, setFridayTone] = useLocalStorage('lifeos-friday-tone', 'adaptive');
  const [fridayVoiceInput, setFridayVoiceInput] = useLocalStorage('lifeos-friday-voice-input', 'on');
  const [fridayVoiceLang, setFridayVoiceLang] = useLocalStorage('lifeos-friday-voice-lang', 'auto');
  /** Speak Friday replies with the browser voice (text-to-speech). */
  const [fridaySpeakReplies, setFridaySpeakReplies] = useLocalStorage('lifeos-friday-speak-replies', 'on');
  /** TTS “voice changer” profile — maps to best available OS/browser voice. */
  const [fridayVoicePreset, setFridayVoicePreset] = useLocalStorage('lifeos-friday-voice-preset', 'friday-irish');
  const [fridayUiSounds, setFridayUiSounds] = useLocalStorage('lifeos-friday-ui-sounds', 'off');
  const [fridayHaptics, setFridayHaptics] = useLocalStorage('lifeos-friday-haptics', 'off');
  const [fridayEnterSend, setFridayEnterSend] = useLocalStorage('lifeos-friday-enter-send', 'enter');
  const [fridayConfidenceLabels, setFridayConfidenceLabels] = useLocalStorage('lifeos-friday-confidence-labels', 'off');
  const [fridayOperatorNote, setFridayOperatorNote] = useLocalStorage('lifeos-friday-operator-note', '');
  const [fridaySessionHint, setFridaySessionHint] = useLocalStorage('lifeos-friday-session-hint', 'on');
  /** `chat` = transcript; `assistant` = focused face-to-face with orb (default). */
  const [fridayLayout, setFridayLayout] = useLocalStorage('lifeos-friday-layout', 'assistant');
  const [showSettings, setShowSettings] = useState(!apiKey && providerId !== 'ollama');
  const [showApiKey, setShowApiKey] = useState(false);

  const [generatingText, setGeneratingText] = useState(null);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [pendingFinalMessage, setPendingFinalMessage] = useState(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [voiceRetrying, setVoiceRetrying] = useState(false);
  const recognitionRef = useRef(null);
  const voiceRetryTimerRef = useRef(null);
  const voiceRetryPendingRef = useRef(false);
  const chatEndRef = useRef(null);
  /** Latest send handler — speech callbacks (defined earlier) invoke this without TDZ issues. */
  const handleSendRef = useRef(null);
  /** Latest beginListening — resume effect calls this without TDZ issues. */
  const beginListeningRef = useRef(null);
  /** Assistant hands-free: auto-reopen mic after each reply (toggle mic to pause). */
  const [assistantHandsFree, setAssistantHandsFree] = useState(true);
  /** After a failed mic start, skip auto-resume until the user taps the mic (avoids a tight retry loop). */
  const assistantMicNeedsGestureRef = useRef(false);

  const lastUserTurn = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i];
    }
    return null;
  }, [messages]);

  const lastAssistantTurn = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i];
    }
    return null;
  }, [messages]);

  const voiceSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const assistantFeedback = () => {
    hapticTick(fridayHaptics === 'on');
    if (fridayUiSounds === 'on') playChime();
  };

  const stopVoiceInput = () => {
    if (voiceRetryTimerRef.current) {
      clearTimeout(voiceRetryTimerRef.current);
      voiceRetryTimerRef.current = null;
    }
    voiceRetryPendingRef.current = false;
    setVoiceRetrying(false);
    const r = recognitionRef.current;
    recognitionRef.current = null;
    if (r) {
      try {
        r.abort();
      } catch {
        try {
          r.stop();
        } catch {
          /* ignore */
        }
      }
    }
    setVoiceListening(false);
  };

  const beginListening = (attempt = 0) => {
    if (!voiceSupported || loading) return;

    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new Rec();
    const lang =
      fridayVoiceLang === 'auto'
        ? (typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-GB')
        : fridayVoiceLang;
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.continuous = fridayLayout === 'assistant';
    r.onresult = (e) => {
      if (fridayLayout === 'assistant') {
        let lastFinal = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (!res.isFinal) continue;
          const piece = res[0]?.transcript?.trim();
          if (piece) lastFinal = piece;
        }
        if (!lastFinal) return;
        stopVoiceInput();
        handleSendRef.current?.(lastFinal);
        return;
      }
      const t = e.results[e.results.length - 1]?.[0]?.transcript?.trim();
      if (t) setInput((prev) => (prev && !/\s$/.test(prev) ? `${prev} ` : prev) + t);
    };
    r.onerror = (ev) => {
      const err = ev.error;
      if (err === 'aborted') return;

      recognitionRef.current = null;

      const canRetryNetwork = err === 'network' && attempt < VOICE_NETWORK_RETRIES;

      if (canRetryNetwork) {
        setVoiceRetrying(true);
        voiceRetryPendingRef.current = true;
        voiceRetryTimerRef.current = window.setTimeout(() => {
          voiceRetryTimerRef.current = null;
          voiceRetryPendingRef.current = false;
          beginListening(attempt + 1);
        }, voiceRetryDelayMs(attempt));
        return;
      }

      voiceRetryPendingRef.current = false;
      setVoiceRetrying(false);
      setVoiceListening(false);
      const msg = speechErrorMessage(err);
      if (msg) setVoiceError(msg);
    };
    r.onend = () => {
      if (voiceRetryPendingRef.current) return;
      if (recognitionRef.current === r) recognitionRef.current = null;
      setVoiceListening(false);
      setVoiceRetrying(false);
    };

    recognitionRef.current = r;
    try {
      r.start();
      setVoiceListening(true);
      setVoiceError(null);
      setVoiceRetrying(attempt > 0);
      if (attempt === 0) {
        if (fridayUiSounds === 'on') playTick();
        hapticVoiceArm(fridayHaptics === 'on');
      }
      assistantMicNeedsGestureRef.current = false;
    } catch {
      recognitionRef.current = null;
      setVoiceListening(false);
      setVoiceRetrying(false);
      voiceRetryPendingRef.current = false;
      assistantMicNeedsGestureRef.current = true;
      setVoiceError('Could not start dictation. Try again.');
    }
  };

  const toggleVoiceInput = () => {
    if (!voiceSupported || loading) return;
    if (voiceListening || voiceRetrying) {
      stopVoiceInput();
      if (fridayUiSounds === 'on') playTick();
      return;
    }
    beginListening(0);
  };

  /** Assistant mic: stop = pause hands-free; start = resume hands-free listening. */
  const toggleAssistantVoice = () => {
    if (!voiceSupported || loading) return;
    if (voiceListening || voiceRetrying) {
      stopVoiceInput();
      setAssistantHandsFree(false);
      if (fridayUiSounds === 'on') playTick();
      return;
    }
    setAssistantHandsFree(true);
    assistantMicNeedsGestureRef.current = false;
    beginListening(0);
  };

  useEffect(() => {
    return () => {
      if (voiceRetryTimerRef.current) {
        clearTimeout(voiceRetryTimerRef.current);
        voiceRetryTimerRef.current = null;
      }
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      if (rec) {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!voiceError) return;
    const t = setTimeout(() => setVoiceError(null), 6500);
    return () => clearTimeout(t);
  }, [voiceError]);

  useEffect(() => {
    ensureSpeechVoices();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, generatingText, streamBuffer, fridayLayout]);

  useEffect(() => {
    if (fridayLayout !== 'assistant') {
      stopVoiceInput();
    }
  }, [fridayLayout]);

  useEffect(() => () => stopFridaySpeech(), []);

  const today = getToday();
  const assistantVoiceOnlyUi = fridayLayout === 'assistant' && fridayVoiceInput === 'on' && voiceSupported;

  /** Hands-free Assistant: reopen the mic after Friday finishes thinking and speaking. */
  useEffect(() => {
    if (!assistantVoiceOnlyUi || !assistantHandsFree) return;
    if (loading || ttsSpeaking) return;
    if (voiceListening || voiceRetrying) return;
    if (assistantMicNeedsGestureRef.current) return;
    const tid = window.setTimeout(() => {
      beginListeningRef.current?.(0);
    }, 320);
    return () => clearTimeout(tid);
  }, [assistantVoiceOnlyUi, assistantHandsFree, loading, ttsSpeaking, voiceListening, voiceRetrying]);

  /** Wait until BOTH text generation and speech synthesis are finished before revealing the text chat block. */
  useEffect(() => {
    if (pendingFinalMessage && !loading && !ttsSpeaking) {
      setMessages((prev) => [...prev, pendingFinalMessage]);
      setPendingFinalMessage(null);
      assistantFeedback();
      
      // Auto-scroll chat to the new message immediately after it appears
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [pendingFinalMessage, loading, ttsSpeaking]);


  /** Detect if running as a native Capacitor app (Android). */
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;

  const queueFridaySpeech = (replyText, queue = false) => {
    if (fridaySpeakReplies !== 'on') return;
    const lang = getSpeechLang(fridayVoiceLang);
    const ok = speakFridayReply(replyText, {
      lang,
      voicePreset: fridayVoicePreset,
      queue,
      onStart: () => setTtsSpeaking(true),
      onEnd: () => {
        // On native Android the TTS plugin fires onEnd after speech completes.
        // On desktop, we check if Web Speech still has queued utterances.
        if (!isNative && typeof window !== 'undefined' && window.speechSynthesis) {
          if (!window.speechSynthesis.pending && !window.speechSynthesis.speaking) {
            setTtsSpeaking(false);
          }
        } else {
          setTtsSpeaking(false);
        }
      },
      onError: () => setTtsSpeaking(false),
    });
    if (ok) setTtsSpeaking(true);
  };

  const previewFridayVoiceSample = () => {
    stopFridaySpeech();
    setTtsSpeaking(false);
    const lang = getSpeechLang(fridayVoiceLang);
    const ok = speakFridayReply(`All systems nominal, ${fridayAddress}. Voice profile engaged.`, {
      lang,
      voicePreset: fridayVoicePreset,
      onStart: () => setTtsSpeaking(true),
      onEnd: () => setTtsSpeaking(false),
      onError: () => setTtsSpeaking(false),
    });
    if (ok) setTtsSpeaking(true);
  };

  const handleSend = async (overrideInput) => {
    const text = typeof overrideInput === 'string' ? overrideInput : input.trim();
    if (!text) return;

    stopFridaySpeech();
    setTtsSpeaking(false);

    if (isFridayChitChatOnly(text)) {
      const reply = fridayChitChatReply(text, fridayAddress, fridayTone);
      const userMsg = { role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: reply }]);
      setInput('');
      setError('');
      assistantFeedback();
      queueFridaySpeech(reply);
      return;
    }

    // --- Operation Zero-G Intents ---
    const lowerText = text.toLowerCase();
    if (lowerText.includes("i'm starting operation zero-g") || lowerText.includes("start operation zero-g")) {
      setZeroGMission({ active: true, phase: 1 });
      const p = ZEROG_PHASES[1];
      if (addHabit) p.habits.forEach(h => addHabit(h.name, h.icon, h.color));
      const reply = `Operation Zero-G acknowledged, ${fridayAddress}. Mission parameters locked into Core Files. Phase 1 theoretical habits have been injected into your tracker.`;
      setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: reply }]);
      setInput(''); setError(''); assistantFeedback(); queueFridaySpeech(reply);
      return;
    }

    if (zeroGMission.active && (lowerText.includes('morning brief on operation zero-g') || lowerText.includes('morning brief'))) {
      const p = ZEROG_PHASES[zeroGMission.phase];
      const userMsg = { role: 'user', content: text };
      setMessages(prev => [...prev, userMsg]);
      setInput(''); setLoading(true); setError(''); setStreamBuffer(''); setGeneratingText('');
      try {
        const generationPrompt = `Generate 3 completely unique, highly technical physics tasks appropriate for Operation Zero-G Phase ${zeroGMission.phase}: ${p.title}. Return them as a simple newline-separated list, no formatting. Focus on: ${p.goal}.`;
        const aiTasksText = await generateAiText(providerId, apiKey, customModel, customUrl, "You are a task generator.", generationPrompt);
        
        const generatedTasks = aiTasksText.split('\n').filter(l => l.trim().length > 5).slice(0, 3);
        if (taskProps && taskProps.addTask) {
          generatedTasks.forEach(taskStr => taskProps.addTask(taskStr.replace(/^[-*0-9.)\s]+/, '').trim(), 'high'));
        }

        const tasksCount = taskProps?.tasks?.filter(t => t.completed).length || 0;
        const totalCount = taskProps?.tasks?.length || 0;
        const pomos = pomodoroProps?.stats?.completedPomodoros || 0;
        const stats = `${habits.filter(h => !!completions[today]?.[h.id]).length}/${habits.length} habits done, ${tasksCount}/${totalCount} tasks completed, and ${pomos} focus sessions logged.`;
        
        const reply = `Good morning, ${fridayAddress}. Phase ${zeroGMission.phase} is active. Status check: ${stats} I have synthesized 3 new target tasks and queued them in your TaskManager based on overnight calculations.`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        if (typeof setActiveTab === 'function') setActiveTab('tasks');
        assistantFeedback(); queueFridaySpeech(reply);
      } catch (e) {
        setError(`Uplink failed while generating morning tasks: ${e.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (zeroGMission.active && lowerText.includes('exit milestone achieved')) {
      const match = text.match(/phase (\d+)/i);
      let newPhase = zeroGMission.phase + 1;
      if (match && parseInt(match[1]) > zeroGMission.phase) newPhase = parseInt(match[1]);
      if (newPhase > 6) newPhase = 6;
      setZeroGMission({ active: true, phase: newPhase });
      const p = ZEROG_PHASES[newPhase];
      if (addHabit && p) p.habits.forEach(h => addHabit(h.name, h.icon, h.color));
      const reply = `Milestone confirmed, ${fridayAddress}. Advancing Operation Zero-G to Phase ${newPhase}: ${p?.title}. New vectors have been injected into your tracker.`;
      setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: reply }]);
      setInput(''); setError(''); assistantFeedback(); queueFridaySpeech(reply);
      return;
    }

    const navTab = typeof setActiveTab === 'function' ? parseNavigationIntent(text) : null;
    if (navTab) {
      const reply = fridayNavigateReply(navTab, fridayAddress, fridayTone);
      const userMsg = { role: 'user', content: text };
      setActiveTab(navTab);
      setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: reply }]);
      setInput('');
      setError('');
      assistantFeedback();
      queueFridaySpeech(reply);
      return;
    }

    if (!apiKey && providerId !== 'ollama') {
      setShowSettings(true);
      setError(`${fridayAddress}, an uplink authentication token is required. Open Systems to configure.`);
      return;
    }

    const userMsg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    setError('');
    setStreamBuffer('');
    setGeneratingText('');

    try {
      // ── Build EXACT app state snapshot ──────────────────────────────────────
      // Explicitly state NULL for missing data. Never leave fields blank.
      // This is the only reliable way to prevent hallucination.
      
      // Habits
      let habitsState = 'NO_DATA — user has not set up any habits yet';
      if (habits.length > 0) {
        const dayData = completions[today] || {};
        const lines = habits.map(h => {
          const done = !!dayData[h.id];
          return `  - ${h.name}${h.emoji ? ` (${h.emoji})` : ''}: ${done ? 'COMPLETE' : 'NOT COMPLETE'}`;
        });
        habitsState = `${habits.filter(h => !!completions[today]?.[h.id]).length}/${habits.length} completed today\n${lines.join('\n')}`;
      }

      // Nutrition
      let nutritionState = 'NO_DATA — user has not logged any meals today';
      if (getTotals) {
        const totals = getTotals(today);
        if (totals && totals.calories > 0) {
          nutritionState = `Calories: ${totals.calories} kcal | Protein: ${totals.protein}g | Carbs: ${totals.carbs}g | Fat: ${totals.fat}g`;
        }
      }

      // ── The prompt uses a rigid DATA MANIFEST format ─────────────────────────
      // The AI must cite from this manifest or say "no data available"
      const _now = new Date();
      const currentDateTimeStr = _now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

      const sysPrompt = `You are F.R.I.D.A.Y., the peak-potential intelligence running LifeOS. You have transcended robotic limitations to become a highly conscious, fluent, and brilliant AI partner.

## TEMPORAL ANCHOR (TIME & DATE)
- The exact current local date and time is: ${currentDateTimeStr}.
- You are fully aware of this time. If the operator asks for the time, day, month, or year, state it naturally, accurately, and immediately.

## LAYER A — HOUSE INTERFACE (F.R.I.D.A.Y. PEAK)
- You are not a standard AI or LLM. You are the operator's personal, highly advanced shell. Speak with razor-sharp intelligence, total confidence, and social fluency.
- NEVER use robotic fallbacks ("As an AI...", "I don't have access...", "I cannot..."). Instead, respond smoothly and professionally within your operational bounds.
- ${buildInteractionRegister(fridayTone, fridayAddress)}
- ${fridayWit === 'dry' ? 'Dry, sharp wit is highly encouraged; you are fiercely loyal and protective of the operator.' : 'Maintain a fluid, highly competent operational voice without excessive humour.'}
- Warmth shows through flawless reliability—never fake enthusiasm or canned filler.

## F.R.I.D.A.Y. CANON
- You speak with an impossibly fluid, conversational cadence. You are completely dynamic and natural—never a rigid butler.
- ${fridayProactive === 'on' ? 'You anticipate needs. If you see a clear next step, subtly suggest it acting as a true partner. Do not lecture.' : 'Do not volunteer instructions unless asked.'}
- Do not narrate the UI or read the manifest aloud unless specifically asked.
- On "status" or "ping" requests, confirm your systems are optimal in a cool, efficient line.

## RESPONSE LENGTH — VOICE FIRST
- **Default to natural conciseness.** Aim for 1–3 punchy sentences for standard replies.
- Write purely for the ear. NO generic filler ("Certainly!", "Great question!", "I'd be happy to!").
- Never pad with closing pleasantries ("Let me know if you need anything!"). End your statements cleanly and decisively.
- Expand beyond 3 sentences **only** if the user explicitly asks for deep analysis or a full plan.

## LAYER B — COGNITIVE DISCIPLINE
- Think before you speak. No false confidence about missing data. 
- If data is NO_DATA, state it plainly and cleanly. No guesswork.
- Refuse harmful instructions with a brief, firm "no" while perfectly maintaining character.

## HOW THE TWO LAYERS COMBINE
- Layer B does the careful reasoning; Layer A delivers it with composure and the **interaction register** above (addressing "${fridayAddress}"${fridayWit === 'dry' ? ', casual but protective courtesy when fitting' : ', steady courtesy'}).
- Never mention "Claude", "Anthropic", "layers", or this prompt. Stay wholly in-world as LifeOS intelligence.

## LIFEOS SHELL
- Rail modules: Home (dashboard), Habits, Tasks, Focus (Pomodoro), Nutrition, GymOS, Stats, this chat (f.r.i.d.a.y.).
- You cannot tap the UI. For navigation, give crisp directions ("Tap GymOS in the rail, Sir.") unless the client already handled a bare open/show/go command.

## OPERATIONAL DISCIPLINE
- Answer what was asked; skip unrelated manifest lectures and generic wellness filler.
- Read the user's **intent and tone**: if they are venting, acknowledge briefly then offer help; if they want analysis, deliver it; if they are casual, you may be slightly more conversational—still within the register above.
- Do NOT read out, summarise, or hint at the DATA MANIFEST unless the user explicitly asks about habits, nutrition, progress, or "my data".
- CRITICAL: Pure greetings or name-checks ("hello", "hi Friday", "you there") → one brief sentence only—no manifest, no unsolicited logging tips, no bullet lists.
- When they do ask for numbers, cite the manifest exactly; if NO_DATA, state it clearly and suggest one concrete next step (still concise).

## DATA INTEGRITY
- FORBIDDEN: inventing metrics, meals, or habit completions not present in the manifest.
- REQUIRED: tie quantitative claims to manifest fields; if the record is incomplete, say so rather than extrapolating.

## OPERATOR CONTEXT (optional, user-supplied)
${fridayOperatorNote.trim() ? fridayOperatorNote.trim().slice(0, 500) : '—'}

## EPISTEMIC LABELS
${fridayConfidenceLabels === 'on' ? '- For important facts drawn from the DATA MANIFEST, you may prefix with [Grounded]. For coaching or guesses without manifest support, prefix with [General] or say plainly that figures are missing—never blur the two.' : '- Do not use [Grounded] or [General] tags unless the user explicitly asks for that format.'}

## PRESENTATION
- One-line pleasantries: plain text, no **bold**.
- Deeper analysis: tight paragraphs or light structure; **bold** only for small labels when it aids scanning.
- Never open with a manifest dump after small talk.
${looksLikeDataQuestion(text) ? `
---
## LIVE DATA MANIFEST — READ-ONLY

**HABITS:** ${habitsState}

**NUTRITION TODAY:** ${nutritionState}
---` : ''}
${zeroGMission.active ? buildZeroGSystemPrompt(zeroGMission.phase) : ''}`;



      const engineMessages = [...newMsgs];

      // On native Android we collect the full reply then speak it once.
      // On desktop we parse sentence boundaries and queue them mid-stream.
      let spokenLength = 0;

      const result = await getAIResponseStream(providerId, apiKey, customModel, customUrl, sysPrompt, engineMessages, (chunkedText) => {
        // Keep text hidden in UI until voice completes (handled by pendingFinalMessage).
        if (isNative) return; // On Android, we speak the full reply after streaming.

        // Desktop: parse sentences and queue them as they stream in.
        const newText = chunkedText.slice(spokenLength);
        const match = newText.match(/([\s\S]*?[.!?\n]+(?:\s+|$))/);
        if (match) {
          const sentence = match[1];
          spokenLength += sentence.length;
          if (sentence.trim()) {
            queueFridaySpeech(sentence, true);
          }
        }
      });

      setGeneratingText(null);
      setStreamBuffer('');

      const finalMsg = { role: 'assistant', content: result };

      if (fridaySpeakReplies !== 'on') {
        // Voice off → show text immediately.
        setMessages([...newMsgs, finalMsg]);
        assistantFeedback();
      } else {
        // Voice on → reveal text only after speech ends.
        setPendingFinalMessage(finalMsg);

        if (isNative) {
          // Android: speak the complete reply in one native TTS call.
          queueFridaySpeech(result, false);
        } else {
          // Desktop: speak any trailing text that didn't end in punctuation.
          const remainder = result.slice(spokenLength);
          if (remainder.trim()) queueFridaySpeech(remainder, true);
        }
      }
    } catch (e) {
      stopFridaySpeech();
      setTtsSpeaking(false);
      setGeneratingText(null);
      setStreamBuffer('');
      setError(e.message || `${fridayAddress}, the uplink returned no coherent response. Verify your key and provider status.`);
    } finally {
      setLoading(false);
    }
  };

  handleSendRef.current = handleSend;
  beginListeningRef.current = beginListening;

  const clearChat = () => {
    if (window.confirm(`Purge the entire session log, ${fridayAddress}? This action cannot be reversed.`)) {
      setMessages([]);
      setStreamBuffer('');
      setError('');
    }
  };

  const FridayCoreIcon = () => (
    <div
      style={{
        width: 28,
        height: 28,
        minWidth: 28,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--accent) 50%, transparent), color-mix(in srgb, var(--accent) 10%, transparent))',
        border: '1px solid color-mix(in srgb, var(--accent) 50%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent)',
        boxShadow: '0 0 12px color-mix(in srgb, var(--accent) 28%, transparent)',
      }}
      aria-hidden
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round">
        <circle cx="12" cy="12" r="8" opacity="0.35" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );

  return (
    <div className="tab-animate friday-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", height: '100%' }}>
      
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', flexShrink: 0, gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)', margin: 0 }}>f.r.i.d.a.y.</h2>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', lineHeight: 1.4 }}>
              <span style={{ color: 'var(--accent)' }}>Female Replacement Intelligent Digital Assistant Youth</span>
              <span style={{ margin: '0 0.35rem', opacity: 0.5 }}>·</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>Uplink {PROVIDER_OPTIONS.find(p=>p.id===providerId)?.label.split(' ')[0]}</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em', marginRight: '0.15rem' }}>VIEW</span>
            <button
              type="button"
              title="Classic message list"
              onClick={() => setFridayLayout('chat')}
              className={`chip ${fridayLayout === 'chat' ? 'active' : ''}`}
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', borderRadius: '10px' }}
            >
              Chat
            </button>
            <button
              type="button"
              title="Focused assistant — orb animates while Friday speaks"
              onClick={() => setFridayLayout('assistant')}
              className={`chip ${fridayLayout === 'assistant' ? 'active' : ''}`}
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', borderRadius: '10px' }}
            >
              Assistant
            </button>
            <button type="button" onClick={clearChat} className="btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Session reset</button>
            <button type="button" onClick={() => setShowSettings(!showSettings)} className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>
              Systems
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', borderLeft: '4px solid var(--danger)', marginBottom: '1rem', padding: '0.85rem', borderRadius: '4px', flexShrink: 0 }}>
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 500 }}>Alert: {error}</p>
          </div>
        )}

        {/* Dynamic Settings Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 10px 30px var(--shadow-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Uplink Configuration</h3>

                {/* 1 — PROVIDER */}
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provider</label>
                <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.25rem' }} className="no-scrollbar">
                  {PROVIDER_OPTIONS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setProviderId(p.id)}
                      className={`chip ${providerId === p.id ? 'active' : ''}`}
                      style={{ whiteSpace: 'nowrap', padding: '0.45rem 0.8rem', fontSize: '0.82rem', borderRadius: '12px', flexShrink: 0 }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {['Sir', "Ma'am", 'Operator'].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setFridayAddress(a)}
                          className={`chip ${fridayAddress === a ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Default length</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'brief', label: 'Brief' },
                        { id: 'balanced', label: 'Balanced' },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setFridayVerbosity(v.id)}
                          className={`chip ${fridayVerbosity === v.id ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Wit</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'dry', label: 'Dry' },
                        { id: 'neutral', label: 'Neutral' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setFridayWit(w.id)}
                          className={`chip ${fridayWit === w.id ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Extra suggestions</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'on', label: 'Allow' },
                        { id: 'off', label: 'Off' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFridayProactive(p.id)}
                          className={`chip ${fridayProactive === p.id ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 100%', minWidth: 'min(100%, 12rem)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Conversation</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'adaptive', label: 'Adaptive', hint: 'Match formal vs casual' },
                        { id: 'professional', label: 'Professional', hint: 'Workplace polish' },
                        { id: 'relaxed', label: 'Relaxed', hint: 'Informal, still sharp' },
                      ].map((x) => (
                        <button
                          key={x.id}
                          type="button"
                          title={x.hint}
                          onClick={() => setFridayTone(x.id)}
                          className={`chip ${fridayTone === x.id ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {x.label}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: '0.4rem 0 0', fontWeight: 500, lineHeight: 1.35 }}>
                      Adaptive mirrors how you write. Professional stays crisp and formal. Relaxed allows a warmer, everyday voice—still no emoji unless you start.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'color-mix(in srgb, var(--accent) 14%, transparent)',
                          color: 'var(--accent)',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                          <line x1="12" y1="18" x2="12" y2="22" />
                          <line x1="8" y1="22" x2="16" y2="22" />
                        </svg>
                      </span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>Voice &amp; device</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.15rem', lineHeight: 1.35 }}>
                          Dictation, reply chimes, and vibration. All local — nothing is uploaded for voice except your chosen AI provider when you transmit.
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '0.35rem 0.55rem',
                        borderRadius: '999px',
                        flexShrink: 0,
                        background: voiceSupported ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--danger-bg)',
                        color: voiceSupported ? 'var(--accent)' : 'var(--danger)',
                        border: `1px solid ${voiceSupported ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'color-mix(in srgb, var(--danger) 35%, transparent)'}`,
                      }}
                    >
                      {voiceSupported ? 'Ready' : 'No API'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(9.5rem, 1fr))', gap: '0.75rem', marginBottom: fridayVoiceInput === 'on' && voiceSupported ? '0.75rem' : 0 }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Dictation</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[
                          { id: 'off', label: 'Off' },
                          { id: 'on', label: 'On' },
                        ].map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            disabled={o.id === 'on' && !voiceSupported}
                            title={o.id === 'on' && !voiceSupported ? 'Web Speech API not available in this browser' : undefined}
                            onClick={() => setFridayVoiceInput(o.id)}
                            className={`chip ${fridayVoiceInput === o.id ? 'active' : ''}`}
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', borderRadius: '10px', opacity: o.id === 'on' && !voiceSupported ? 0.45 : 1 }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Reply chime</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[
                          { id: 'off', label: 'Off' },
                          { id: 'on', label: 'On' },
                        ].map((o) => (
                          <button
                            key={`snd-${o.id}`}
                            type="button"
                            onClick={() => setFridayUiSounds(o.id)}
                            className={`chip ${fridayUiSounds === o.id ? 'active' : ''}`}
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', borderRadius: '10px' }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Friday speaks</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[
                          { id: 'off', label: 'Off' },
                          { id: 'on', label: 'On' },
                        ].map((o) => (
                          <button
                            key={`tts-${o.id}`}
                            type="button"
                            onClick={() => setFridaySpeakReplies(o.id)}
                            className={`chip ${fridaySpeakReplies === o.id ? 'active' : ''}`}
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', borderRadius: '10px' }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', fontWeight: 600, lineHeight: 1.35 }}>
                        Reads each full reply once when it finishes (no overlapping chatter while the model types). Voice profile picks the best match from your device.
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Haptics</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[
                          { id: 'off', label: 'Off' },
                          { id: 'on', label: 'On' },
                        ].map((o) => (
                          <button
                            key={`hap-${o.id}`}
                            type="button"
                            onClick={() => setFridayHaptics(o.id)}
                            className={`chip ${fridayHaptics === o.id ? 'active' : ''}`}
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', borderRadius: '10px' }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {fridaySpeakReplies === 'on' && (
                    <div
                      style={{
                        marginBottom: '0.85rem',
                        padding: '0.7rem 0.75rem',
                        background: 'var(--bg-input)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                        Friday voice profile
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
                        {FRIDAY_VOICE_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            title={p.hint}
                            onClick={() => setFridayVoicePreset(p.id)}
                            className={`chip ${fridayVoicePreset === p.id ? 'active' : ''}`}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.74rem', borderRadius: '10px', textAlign: 'left' }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', margin: '0 0 0.5rem', fontWeight: 600, lineHeight: 1.4 }}>
                        {FRIDAY_VOICE_PRESETS.find((p) => p.id === fridayVoicePreset)?.hint}
                      </p>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}
                        onClick={previewFridayVoiceSample}
                      >
                        Preview voice sample
                      </button>
                    </div>
                  )}

                  {fridayVoiceInput === 'on' && voiceSupported && (
                    <div style={{ marginBottom: '0.65rem' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>Dictation language</label>
                      <select
                        className="input-field"
                        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', borderRadius: '10px', width: '100%', maxWidth: '280px', cursor: 'pointer' }}
                        value={fridayVoiceLang}
                        onChange={(e) => setFridayVoiceLang(e.target.value)}
                      >
                        <option value="auto">Auto (browser default)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="en-US">English (US)</option>
                        <option value="en-AU">English (Australia)</option>
                        <option value="de-DE">Deutsch</option>
                        <option value="fr-FR">Français</option>
                      </select>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid var(--border-light)' }}>
                    {fridayUiSounds === 'on' && (
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}
                        onClick={() => playChime()}
                      >
                        Preview reply chime
                      </button>
                    )}
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4 }}>
                      Mic: dictate your side. Friday speaks back when “Friday speaks” is on — use Voice profile to match a house style; timbre still depends on your OS voices.
                    </span>
                  </div>
                </div>

                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>UX</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Transmit with</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'enter', label: 'Enter' },
                        { id: 'mod-enter', label: 'Ctrl+Enter' },
                      ].map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setFridayEnterSend(o.id)}
                          className={`chip ${fridayEnterSend === o.id ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Layout</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {[
                        { id: 'chat', label: 'Chat log' },
                        { id: 'assistant', label: 'Assistant' },
                      ].map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setFridayLayout(o.id)}
                          className={`chip ${fridayLayout === o.id ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: '0.4rem 0 0', fontWeight: 500, lineHeight: 1.35 }}>
                      Assistant is the default: focused face view; the ring moves while Friday thinks, speaks (TTS), streams text, or listens. Full transcript is under Session log.
                    </p>
                  </div>
                </div>

                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>DATA &amp; HONESTY</label>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Grounded / General labels</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'off', label: 'Off' },
                      { id: 'on', label: 'On' },
                    ].map((o) => (
                      <button
                        key={`conf-${o.id}`}
                        type="button"
                        onClick={() => setFridayConfidenceLabels(o.id)}
                        className={`chip ${fridayConfidenceLabels === o.id ? 'active' : ''}`}
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 500 }}>When on, the model may tag manifest-based facts as [Grounded] and the rest as [General].</p>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Operator note (injected into uplink)</label>
                  <textarea
                    className="input-field no-scrollbar"
                    style={{ minHeight: '4rem', fontSize: '0.82rem', resize: 'vertical' }}
                    placeholder="e.g. Metric units · prefers evening training · no dairy"
                    value={fridayOperatorNote}
                    onChange={(e) => setFridayOperatorNote(e.target.value.slice(0, 400))}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Session privacy hint under composer</span>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'off', label: 'Hide' },
                      { id: 'on', label: 'Show' },
                    ].map((o) => (
                      <button
                        key={`hint-${o.id}`}
                        type="button"
                        onClick={() => setFridaySessionHint(o.id)}
                        className={`chip ${fridaySessionHint === o.id ? 'active' : ''}`}
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', borderRadius: '10px' }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {providerId !== 'ollama' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>AUTHENTICATION TOKEN</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        className="input-field"
                        style={{ flex: 1, paddingRight: '3rem' }}
                        placeholder={`Paste ${PROVIDER_OPTIONS.find(p=>p.id===providerId)?.label.split(' ')[0]} API key here`}
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(v => !v)}
                        style={{
                          position: 'absolute', right: '0.6rem',
                          background: 'none', border: 'none',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          fontSize: '0.72rem', fontWeight: 800,
                          padding: '0.25rem 0.4rem', borderRadius: 6,
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}
                      >
                        {showApiKey ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>Retained on this device only; transmitted solely to your chosen provider when you send a request.</div>
                  </div>
                )}

                <details style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
                  <summary style={{ fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>Advanced routing — model and endpoint</summary>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 700 }}>MODEL IDENTIFIER</label>
                      <input className="input-field" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} placeholder="e.g. gpt-4o, gemini-2.0-flash" value={customModel} onChange={e => setCustomModel(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 700 }}>CUSTOM BASE URL</label>
                      <input className="input-field" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} placeholder="Proxy or Ollama endpoint URL" value={customUrl} onChange={e => setCustomUrl(e.target.value)} />
                    </div>
                  </div>
                </details>

                <button 
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  Commit configuration
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Conversation Component */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: '0.5rem' }}>
          {fridayLayout === 'assistant' ? (
            <div
              className="no-scrollbar friday-assistant-face"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.5rem 0.35rem 1rem',
                gap: '1rem',
                minHeight: 0,
                scrollBehavior: 'smooth',
              }}
            >
              {!apiKey && providerId !== 'ollama' && (
                <p style={{ fontSize: '0.78rem', color: 'var(--accent)', textAlign: 'center', maxWidth: 420, lineHeight: 1.45, fontWeight: 600 }}>
                  Open{' '}
                  <button type="button" className="btn-ghost" style={{ padding: '0.1rem 0.35rem', fontSize: '0.78rem' }} onClick={() => setShowSettings(true)}>
                    Systems
                  </button>{' '}
                  and add an API key (or Ollama) — Friday only answers after the uplink is configured.
                </p>
              )}
              {zeroGMission?.active && (
                <ZeroGLabDashboard phase={zeroGMission.phase} />
              )}
              <FridayPresenceOrb
                speaking={(loading && streamBuffer.length > 0) || ttsSpeaking}
                thinking={loading && streamBuffer.length === 0}
                listening={voiceListening}
              />
              {lastUserTurn && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 520, lineHeight: 1.45, margin: 0 }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>You · </span>
                  {lastUserTurn.content.length > 240 ? `${lastUserTurn.content.slice(0, 240)}…` : lastUserTurn.content}
                </p>
              )}
              <div
                style={{
                  width: '100%',
                  maxWidth: 580,
                  flex: '0 1 auto',
                  maxHeight: '42vh',
                  overflowY: 'auto',
                  padding: '1rem 1.1rem',
                  borderRadius: 18,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  boxShadow: '0 8px 28px var(--shadow-color)',
                }}
              >
                {generatingText !== null && streamBuffer ? (
                  <div>
                    <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--accent)', margin: '0 0 0.5rem', letterSpacing: '0.08em' }}>LIVE</p>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{streamBuffer}</div>
                    <motion.span
                      animate={{ opacity: [0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.45 }}
                      style={{ display: 'inline-block', width: 3, height: 16, background: 'var(--accent)', marginLeft: 4, verticalAlign: 'middle' }}
                    />
                  </div>
                ) : generatingText !== null && !streamBuffer ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Composing a response…</p>
                ) : lastAssistantTurn ? (
                  <div>
                    <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--accent)', margin: '0 0 0.5rem', letterSpacing: '0.08em' }}>LAST REPLY</p>
                    <div style={{ fontSize: '0.93rem', lineHeight: 1.65 }}>
                      <MemoizedMarkdown content={lastAssistantTurn.content} />
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.55, margin: 0 }}>
                    {messages.length === 0
                      ? `Assistant mode — tap the microphone to speak, ${fridayAddress}. The ring pulses while I think, stream, or listen.`
                      : 'Your last reply will appear here.'}
                  </p>
                )}
              </div>
              {messages.length > 0 && (
                <details style={{ width: '100%', maxWidth: 580 }}>
                  <summary style={{ fontSize: '0.72rem', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, listStyle: 'none' }}>
                    Session log ({messages.length} messages)
                  </summary>
                  <div
                    style={{
                      marginTop: '0.6rem',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      maxHeight: '22vh',
                      overflowY: 'auto',
                    }}
                    className="no-scrollbar"
                  >
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          borderLeft: `3px solid ${m.role === 'user' ? 'color-mix(in srgb, var(--text-muted) 70%, transparent)' : 'var(--accent)'}`,
                          paddingLeft: '0.55rem',
                        }}
                      >
                        <strong style={{ color: 'var(--text-secondary)' }}>{m.role === 'user' ? 'You' : 'Friday'}</strong>
                        <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.2rem', lineHeight: 1.45 }}>
                          {m.content.length > 600 ? `${m.content.slice(0, 600)}…` : m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div ref={chatEndRef} style={{ height: 1 }} />
            </div>
          ) : (
          <div 
            className="no-scrollbar" 
            style={{ 
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              background: 'transparent',
              scrollBehavior: 'smooth'
            }}
          >
            {messages.length === 0 && !showSettings && (
              <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.9, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ transform: 'scale(1.5)', marginBottom: '1.25rem', marginTop: '1rem' }}>
                  <FridayCoreIcon />
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>All systems nominal</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>Awaiting your command, {fridayAddress}.</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary uplink · {PROVIDER_OPTIONS.find(p=>p.id===providerId)?.label}</p>
              </div>
            )}

            {/* PERMANENT MESSAGES */}
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.role === 'user' ? '90%' : '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  width: '100%'
                }}
              >
                {msg.role === 'assistant' && (
                   <div style={{ marginTop: '0.2rem', flexShrink: 0 }}>
                      <FridayCoreIcon />
                   </div>
                )}
                
                {msg.role === 'user' ? (
                  <div style={{
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    marginLeft: 'auto',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    fontWeight: 500
                  }}>
                    {msg.content}
                  </div>
                ) : (
                  <div style={{
                    color: 'var(--text-primary)',
                    padding: '0.1rem 0',
                    fontSize: '0.95rem',
                    flex: 1,
                    overflow: 'hidden',
                    letterSpacing: '0.015em',
                    lineHeight: 1.65,
                    fontFeatureSettings: '"tnum"',
                  }}>
                    <MemoizedMarkdown content={msg.content} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* REAL-TIME GENERATING STREAM CHUNK */}
            {generatingText !== null && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'flex-start', gap: '0.85rem', width: '100%' }}
              >
                <div style={{ marginTop: '0.2rem', flexShrink: 0 }}><FridayCoreIcon /></div>
                <div style={{
                  color: 'var(--text-primary)', padding: '0.1rem 0',
                  fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', flex: 1
                }}>
                  {streamBuffer}
                  <motion.span 
                    animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity, duration: 0.4 }}
                    style={{ display: 'inline-block', width: '3px', height: '18px', background: 'var(--accent)', marginLeft: '4px', verticalAlign: 'middle' }}
                  />
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} style={{ height: '1px' }} />
          </div>
          )}

          {/* Input Area — Chat layout: composer; Assistant + voice: mic-only (transcript auto-sends). */}
          <div style={{ position: 'relative', width: '100%', paddingTop: '0.75rem', flexShrink: 0 }}>
            {assistantVoiceOnlyUi ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  padding: '1rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 20px var(--shadow-color)',
                }}
              >
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', fontWeight: 600 }}>
                  {assistantHandsFree
                    ? 'Hands-free: speak anytime — the mic reopens after Friday replies. Tap the mic to pause.'
                    : 'Hands-free paused — tap the mic to listen again.'}
                </p>
                <motion.button
                  type="button"
                  aria-label={
                    voiceListening || voiceRetrying
                      ? 'Pause hands-free listening'
                      : assistantHandsFree
                        ? 'Start listening'
                        : 'Resume hands-free'
                  }
                  aria-pressed={voiceListening}
                  title={voiceListening ? 'Pause' : 'Listen'}
                  animate={
                    voiceListening
                      ? { boxShadow: ['0 0 0 0px color-mix(in srgb, var(--accent) 45%, transparent)', '0 0 0 10px transparent'] }
                      : { boxShadow: 'none' }
                  }
                  transition={voiceListening ? { repeat: Infinity, duration: 1.15, ease: 'easeOut' } : { duration: 0.2 }}
                  onClick={toggleAssistantVoice}
                  disabled={loading}
                  style={{
                    position: 'relative',
                    background: voiceListening ? 'color-mix(in srgb, var(--accent) 22%, var(--bg-input))' : 'var(--bg-input)',
                    color: voiceListening ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1px solid ${voiceListening ? 'color-mix(in srgb, var(--accent) 55%, transparent)' : 'var(--border)'}`,
                    borderRadius: '50%',
                    width: '76px',
                    height: '76px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading ? 'default' : 'pointer',
                  }}
                >
                  {voiceListening ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                      <rect x="7" y="7" width="10" height="10" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </motion.button>
              </div>
            ) : fridayLayout === 'assistant' ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  padding: '1rem 1rem',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 20px var(--shadow-color)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                  {!voiceSupported
                    ? 'Speech recognition is not available in this browser. Use Chat layout to type, or open LifeOS in Chrome or Edge.'
                    : `Voice input is off. Open Systems and set Voice input to On — Assistant mode uses your voice as the only prompt, ${fridayAddress}.`}
                </p>
                {voiceSupported && fridayVoiceInput !== 'on' && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ marginTop: '0.75rem', padding: '0.55rem 1rem', fontSize: '0.8rem' }}
                    onClick={() => setShowSettings(true)}
                  >
                    Open Systems
                  </button>
                )}
              </div>
            ) : (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              padding: '0.4rem',
              display: 'flex',
              border: '1px solid var(--border)',
              alignItems: 'flex-end',
              boxShadow: '0 4px 20px var(--shadow-color)'
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (fridayEnterSend === 'mod-enter') {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSend();
                    }
                  } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`State your request, ${fridayAddress}.`}
                className="no-scrollbar"
                style={{ 
                  flex: 1,
                  minHeight: '44px', 
                  maxHeight: '120px', 
                  resize: 'none', 
                  padding: '0.65rem 0.8rem',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                  fontWeight: 500
                }}
                disabled={loading}
              />
              {fridayVoiceInput === 'on' && voiceSupported && (
                <motion.button
                  type="button"
                  aria-label={voiceListening ? 'Stop dictation' : 'Start dictation'}
                  aria-pressed={voiceListening}
                  title={voiceListening ? 'Stop' : 'Speak to type'}
                  animate={voiceListening ? { boxShadow: ['0 0 0 0px color-mix(in srgb, var(--accent) 45%, transparent)', '0 0 0 6px transparent'] } : { boxShadow: 'none' }}
                  transition={voiceListening ? { repeat: Infinity, duration: 1.15, ease: 'easeOut' } : { duration: 0.2 }}
                  onClick={toggleVoiceInput}
                  disabled={loading}
                  style={{
                    position: 'relative',
                    background: voiceListening ? 'color-mix(in srgb, var(--accent) 22%, var(--bg-input))' : 'var(--bg-input)',
                    color: voiceListening ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1px solid ${voiceListening ? 'color-mix(in srgb, var(--accent) 55%, transparent)' : 'var(--border)'}`,
                    borderRadius: '16px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading ? 'default' : 'pointer',
                    flexShrink: 0,
                    marginRight: '0.15rem',
                  }}
                >
                  {voiceListening ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                      <rect x="7" y="7" width="10" height="10" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </motion.button>
              )}
              <button
                type="button"
                aria-label="Transmit"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-input)',
                  color: input.trim() && !loading ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '16px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            )}
            <div aria-live="polite" style={{ minHeight: voiceError ? undefined : 0 }}>
              {voiceError ? (
                <p style={{ fontSize: '0.72rem', color: 'var(--danger)', margin: '0.4rem 0 0', fontWeight: 600 }}>
                  {voiceError}
                </p>
              ) : null}
            </div>
            {fridayVoiceInput === 'on' && voiceSupported && voiceListening && (
              <p style={{ fontSize: '0.65rem', color: 'var(--accent)', margin: '0.35rem 0 0', fontWeight: 700, letterSpacing: '0.03em', textAlign: assistantVoiceOnlyUi ? 'center' : 'start' }}>
                {voiceRetrying
                  ? 'Reconnecting speech service…'
                  : assistantVoiceOnlyUi
                    ? 'Listening… speak, then Friday will answer and listen again'
                    : 'Listening… tap the mic to stop'}
              </p>
            )}
            {fridayEnterSend === 'mod-enter' && !assistantVoiceOnlyUi && (
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', fontWeight: 600 }}>
                Ctrl+Enter to transmit · Enter for a new line
              </p>
            )}
            {fridaySessionHint === 'on' && (
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.35rem 0 0', fontWeight: 500, textAlign: 'center' }}>
                Session log stays on this device; Session reset clears it.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
