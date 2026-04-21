/**
 * F.R.I.D.A.Y. TTS — Dual-engine speech synthesis.
 *
 * ANDROID (Capacitor WebView):  Uses @capacitor-community/text-to-speech
 *   → bridges to Android's native TextToSpeech engine — always works in WebView.
 *
 * DESKTOP / BROWSER:  Falls back to window.speechSynthesis (Web Speech API).
 *   → window.speechSynthesis is NOT reliably available in Android WebView.
 *
 * Detection: Capacitor sets window.Capacitor.isNativePlatform() === true on device.
 */

import { TextToSpeech } from '@capacitor-community/text-to-speech';

// ─── Platform detection ────────────────────────────────────────────────────────

function isNativeAndroid() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.Capacitor?.isNativePlatform?.() === true
    );
  } catch {
    return false;
  }
}

// ─── Markdown stripping ────────────────────────────────────────────────────────

export function stripMarkdownForSpeech(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Lang helper ──────────────────────────────────────────────────────────────

export function getSpeechLang(voiceLangSetting) {
  if (voiceLangSetting === 'auto') {
    return typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en-GB';
  }
  return voiceLangSetting || 'en-GB';
}

// ─── Voice preset definitions ──────────────────────────────────────────────────

export const FRIDAY_VOICE_PRESETS = [
  { id: 'system',      label: 'System default',     hint: 'Device picks a voice for your language.' },
  { id: 'friday-irish',label: 'F.R.I.D.A.Y. · UK/IE', hint: 'Prefers an Irish or British female voice.' },
  { id: 'friday-us',   label: 'F.R.I.D.A.Y. · US',  hint: 'Prefers a clear American female voice.' },
  { id: 'tactical-f',  label: 'Tactical · Female',   hint: 'Slightly lower pitch, steady female cadence.' },
];

// ─── Native Android TTS (Capacitor) ───────────────────────────────────────────

/** Speaking state for native TTS (no onStart/onEnd from plugin in all versions). */
let _nativeSpeaking = false;
let _nativeOnEndCallback = null;
let _nativeOnStartCallback = null;

/**
 * Speak text using native Android TTS.
 * Returns a promise that resolves when speech is queued.
 */
async function nativeSpeak(plain, options = {}) {
  if (!plain) return;

  // Map lang to a locale Android recognises
  const lang = options.lang || 'en-GB';

  // Determine pitch & rate from preset
  let speechRate = 1.05;
  let pitchMultiplier = 1.0;
  const preset = options.voicePreset || 'friday-irish';
  if (preset === 'friday-irish')  { speechRate = 1.05; pitchMultiplier = 1.0; }
  if (preset === 'friday-us')     { speechRate = 1.05; pitchMultiplier = 1.0; }
  if (preset === 'tactical-f')    { speechRate = 1.0;  pitchMultiplier = 0.95; }

  _nativeSpeaking = true;
  _nativeOnStartCallback = options.onStart || null;
  _nativeOnEndCallback   = options.onEnd   || null;

  if (_nativeOnStartCallback) {
    try { _nativeOnStartCallback(); } catch { /* ignore */ }
  }

  try {
    await TextToSpeech.speak({
      text: plain,
      lang: lang,
      rate: speechRate,
      pitch: pitchMultiplier,
      volume: 1.0,
      category: 'ambient',
    });
  } catch (err) {
    console.warn('[FRIDAY TTS] Native speak error:', err);
  } finally {
    _nativeSpeaking = false;
    if (_nativeOnEndCallback) {
      try { _nativeOnEndCallback(); } catch { /* ignore */ }
    }
    _nativeOnEndCallback  = null;
    _nativeOnStartCallback = null;
  }
}

async function nativeStop() {
  try {
    await TextToSpeech.stop();
  } catch { /* ignore */ }
  _nativeSpeaking = false;
  if (_nativeOnEndCallback) {
    try { _nativeOnEndCallback(); } catch { /* ignore */ }
    _nativeOnEndCallback = null;
  }
}

// ─── Web Speech API (desktop / full Chrome) ───────────────────────────────────

let voicesReadyPromise = null;

export function ensureSpeechVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  const syn = window.speechSynthesis;
  const existing = syn.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);
  if (!voicesReadyPromise) {
    voicesReadyPromise = new Promise((resolve) => {
      const done = () => {
        syn.removeEventListener('voiceschanged', done);
        resolve(syn.getVoices());
      };
      syn.addEventListener('voiceschanged', done);
      window.setTimeout(done, 1000);
    });
  }
  return voicesReadyPromise;
}

function langMatches(voice, langCode) {
  if (!voice?.lang) return false;
  const want = (langCode || 'en-GB').toLowerCase();
  const vl = voice.lang.toLowerCase();
  return vl === want || vl.startsWith(want.slice(0, 2));
}

function filterByLang(voices, langCode) {
  const primary = voices.filter((v) => langMatches(v, langCode));
  if (primary.length) return primary;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'));
  return en.length ? en : voices;
}

function firstNameMatch(voices, patterns) {
  for (const re of patterns) {
    const f = voices.find((v) => re.test(v.name));
    if (f) return f;
  }
  return null;
}

export function resolveFridayVoicePreset(presetId, langCode) {
  const voices =
    typeof window !== 'undefined' && window.speechSynthesis
      ? window.speechSynthesis.getVoices()
      : [];
  const pool = filterByLang(voices, langCode);
  const femaleFallback =
    firstNameMatch(pool, [/female|woman|samantha|moira|karen|tessa|victoria|zira|hazel|susan/i]) ||
    pool[0] ||
    voices[0] ||
    null;

  if (!presetId || presetId === 'system') return { voice: femaleFallback, rate: 1.05, pitch: 1 };

  if (presetId === 'friday-irish') {
    const gb = voices.filter((v) =>
      v.lang?.toLowerCase().startsWith('en-gb') || v.lang?.toLowerCase().startsWith('en-ie')
    );
    const use = gb.length ? gb : pool;
    const v =
      firstNameMatch(use, [/moira|tessa|serena|fiona|google uk english female|female.*uk/i, /female/i]) ||
      femaleFallback;
    return { voice: v, rate: 1.05, pitch: 1.1 };
  }

  if (presetId === 'friday-us') {
    const us = voices.filter((v) => v.lang?.toLowerCase().startsWith('en-us'));
    const use = us.length ? us : pool;
    const v =
      firstNameMatch(use, [
        /samantha|karen|victoria|zira|google us english|female.*us/i,
        /female.*united states/i,
        /female/i,
      ]) || femaleFallback;
    return { voice: v, rate: 1.05, pitch: 1.05 };
  }

  if (presetId === 'tactical-f') {
    const v = firstNameMatch(pool, [/hazel|susan|zira|female/i]) || femaleFallback;
    return { voice: v, rate: 1.0, pitch: 0.95 };
  }

  return { voice: femaleFallback, rate: 1.05, pitch: 1 };
}

function webSpeak(plain, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  const syn = window.speechSynthesis;
  if (!options.queue) syn.cancel();

  const lang = options.lang || 'en-GB';
  const preset = options.voicePreset || 'friday-irish';
  const resolved = resolveFridayVoicePreset(preset, lang);

  const u = new SpeechSynthesisUtterance(plain);
  u.lang = lang;
  if (resolved.voice) {
    try { u.voice = resolved.voice; } catch { /* ignore */ }
  }
  u.rate  = typeof options.rate  === 'number' ? options.rate  : resolved.rate;
  u.pitch = typeof options.pitch === 'number' ? options.pitch : resolved.pitch;
  if (options.onStart) u.onstart = options.onStart;
  if (options.onEnd)   u.onend   = options.onEnd;
  if (options.onError) u.onerror = options.onError;
  syn.speak(u);
  return true;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Speak text using the best available engine.
 * On Android Capacitor → native TTS.
 * On desktop / browser → Web Speech API.
 */
export function speakFridayReply(text, options = {}) {
  const plain = stripMarkdownForSpeech(text);
  if (!plain) return false;

  if (isNativeAndroid()) {
    // Fire-and-forget; the async function manages callbacks itself.
    nativeSpeak(plain, options);
    return true;
  }

  // Desktop fallback: Web Speech API with voice-list retry
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  const syn = window.speechSynthesis;
  if (syn.getVoices().length === 0 && !options._voiceRetry) {
    const retry = () => speakFridayReply(text, { ...options, _voiceRetry: true });
    syn.addEventListener('voiceschanged', retry, { once: true });
    // Force fallback after 300 ms even if event doesn't fire
    setTimeout(() => {
      syn.removeEventListener('voiceschanged', retry);
      speakFridayReply(text, { ...options, _voiceRetry: true });
    }, 300);
    return false;
  }

  return webSpeak(plain, options);
}

/**
 * Stop any in-progress speech on all engines.
 */
export function stopFridaySpeech() {
  if (isNativeAndroid()) {
    nativeStop();
    return;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
