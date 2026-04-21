/**
 * LifeOS Multi-Provider AI Client
 * 
 * Supports: OpenAI, Claude, Gemini, OpenRouter, Grok, Perplexity, Ollama
 * Features: Auto-retry with backoff, fallback model chains, clean error parsing
 */

const PROVIDER_CONFIGS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    needsKey: true,
    format: 'openai'
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    // Use the official free router — auto-selects from available free models
    defaultModel: 'openrouter/auto',
    fallbackModels: ['openrouter/auto', 'meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-r1:free', 'qwen/qwen3-8b:free'],
    needsKey: true,
    format: 'openai'
  },
  grok: {
    url: 'https://api.x.ai/v1/chat/completions',
    defaultModel: 'grok-3-mini',
    needsKey: true,
    format: 'openai'
  },
  perplexity: {
    url: 'https://api.perplexity.ai/chat/completions',
    defaultModel: 'sonar',
    needsKey: true,
    format: 'openai'
  },
  ollama: {
    url: 'http://localhost:11434/api/chat',
    defaultModel: 'llama3',
    needsKey: false,
    format: 'ollama'
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse',
    defaultModel: 'gemini-2.0-flash',
    needsKey: true,
    format: 'gemini'
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-haiku-20240307',
    needsKey: true,
    format: 'claude'
  }
};

export const PROVIDER_OPTIONS = [
  { id: 'gemini',      label: 'Gemini (Google)',    desc: 'Free tier, no CORS issues' },
  { id: 'openrouter',  label: 'OpenRouter',         desc: 'Free auto-router, many models' },
  { id: 'openai',      label: 'OpenAI',             desc: 'GPT-4o, needs API key' },
  { id: 'claude',      label: 'Claude (Anthropic)', desc: 'Needs API key + CORS ext' },
  { id: 'grok',        label: 'Grok (xAI)',         desc: 'Needs API key' },
  { id: 'perplexity',  label: 'Perplexity',         desc: 'Needs API key' },
  { id: 'ollama',      label: 'Ollama (Local)',      desc: 'Self-hosted, no key needed' },
];

// ───────────── Helpers ─────────────

function parseErrorMessage(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed.error?.message || parsed.message || raw;
  } catch {
    return raw;
  }
}

function buildRequest(providerId, provider, model, apiKey, systemPrompt, formattedMessages) {
  let url = provider.url;
  const headers = { 'Content-Type': 'application/json' };
  let body = {};

  switch (provider.format) {
    case 'claude':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
      body = {
        model, max_tokens: 1024, system: systemPrompt,
        messages: formattedMessages, stream: true
      };
      break;

    case 'gemini':
      url = url.replace('{model}', model) + '&key=' + apiKey;
      body = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: formattedMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      };
      break;

    case 'ollama':
      body = {
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...formattedMessages]
      };
      break;

    case 'openai':
    default:
      headers['Authorization'] = `Bearer ${apiKey}`;
      if (providerId === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'LifeOS · F.R.I.D.A.Y.';
      }
      body = {
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...formattedMessages],
        stream: true
      };
      break;
  }

  return { url, headers, body };
}

function extractChunkText(providerId, format, parsed) {
  if (format === 'gemini') {
    return parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  if (format === 'claude') {
    return parsed.type === 'content_block_delta' ? (parsed.delta?.text || '') : '';
  }
  // openai-compatible
  return parsed.choices?.[0]?.delta?.content || '';
}

// ───────────── Core Stream Logic ─────────────

async function streamResponse(providerId, format, response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    if (format === 'ollama') {
      // Ollama: newline-delimited JSON
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const p = JSON.parse(line);
          if (p.message?.content) {
            fullText += p.message.content;
            onChunk(fullText);
          }
        } catch { /* skip malformed */ }
      }
    } else {
      // SSE: split on double-newline
      const parts = buffer.split('\n\n');
      buffer = parts.pop();

      for (const part of parts) {
        const lines = part.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ') || line.trim() === 'data: [DONE]') continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const text = extractChunkText(providerId, format, parsed);
            if (text) {
              fullText += text;
              onChunk(fullText);
            }
          } catch { /* skip malformed */ }
        }
      }
    }
  }

  return fullText;
}

// ───────────── Single Attempt ─────────────

async function attemptRequest(providerId, provider, model, apiKey, systemPrompt, messages, onChunk) {
  const formattedMessages = messages.map(m => ({
    role: m.role, content: m.content
  }));

  const { url, headers, body } = buildRequest(providerId, provider, model, apiKey, systemPrompt, formattedMessages);

  let response;
  try {
    response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch (err) {
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
      if (providerId === 'ollama') {
        throw new Error('Cannot connect to Ollama. Ensure it is running on port 11434.');
      }
      if (providerId === 'openai' || providerId === 'claude') {
        throw new Error(`${providerId === 'openai' ? 'OpenAI' : 'Anthropic'} blocks direct browser requests (CORS). Use Gemini or OpenRouter for browser testing, or build for Android where CORS doesn\'t apply.`);
      }
      throw new Error('Network error. Check your internet connection.');
    }
    throw err;
  }

  if (!response.ok) {
    const errText = await response.text();
    const cleanMsg = parseErrorMessage(errText);
    const err = new Error(cleanMsg);
    err.status = response.status;
    throw err;
  }

  return streamResponse(providerId, provider.format, response, onChunk);
}

// ───────────── Public API ─────────────

export async function getAIResponseStream(providerId, apiKey, customModel, customUrl, systemPrompt, messages, onChunk) {
  const provider = PROVIDER_CONFIGS[providerId];
  if (!provider) throw new Error('Unknown provider: ' + providerId);

  // Apply custom URL override
  const originalUrl = provider.url;
  if (customUrl) provider.url = customUrl;

  // Build the list of models to try (primary + fallbacks)
  const primaryModel = customModel || provider.defaultModel;
  const modelsToTry = [primaryModel];

  // Add fallback models if they exist and aren't already the primary
  if (provider.fallbackModels) {
    for (const fb of provider.fallbackModels) {
      if (fb !== primaryModel && !modelsToTry.includes(fb)) {
        modelsToTry.push(fb);
      }
    }
  }

  let lastError = null;

  for (const model of modelsToTry) {
    // Retry each model up to 2 times (with a brief backoff for rate limits)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await attemptRequest(providerId, provider, model, apiKey, systemPrompt, messages, onChunk);
        // Restore original URL
        provider.url = originalUrl;
        return result;
      } catch (err) {
        lastError = err;

        // 429 = rate limited → wait briefly and retry
        if (err.status === 429 && attempt === 0) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        // 404 = model removed → skip to next fallback immediately
        if (err.status === 404) break;
        // 400 = bad model ID → skip to next fallback
        if (err.status === 400) break;
        // Network/CORS errors → no point retrying
        if (!err.status) break;
        // Any other server error (500, 502, 503) → retry once
        if (err.status >= 500 && attempt === 0) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
  }

  // Restore original URL
  provider.url = originalUrl;

  // All models and retries failed
  throw lastError || new Error('All models failed. Please check your API key and try again.');
}

export async function generateAiText(providerId, apiKey, customModel, customUrl, systemPrompt, prompt) {
  let finalText = '';
  await getAIResponseStream(
    providerId, apiKey, customModel, customUrl, systemPrompt, [{ role: 'user', content: prompt }],
    (chunk) => { finalText = chunk; } // onChunk just updates finalText
  );
  return finalText;
}
