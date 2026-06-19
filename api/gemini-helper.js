const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

function parseGeminiResponse(data) {
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini returned no candidates. The image may not have been processed correctly.');
  }

  const candidate = data.candidates[0];
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Gemini flagged the content as unsafe. Please try a different image.');
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Failed to parse Gemini response as JSON.');
      }
    }
    throw new Error('Gemini response did not contain valid JSON.');
  }
}

export async function callGemini(prompt, base64Image, mimeType, options = {}) {
  if (!GEMINI_API_KEY) {
    const err = new Error('GEMINI_API_KEY is not configured. Please add it to your environment variables to use AI features.');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64Image } },
      ],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 8192,
    },
  };

  const modelsToTry = [GEMINI_MODEL, ...FALLBACK_MODELS.filter(m => m !== GEMINI_MODEL)];
  let lastError;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error with model ${model}:`, response.status, errorText);
        lastError = new Error(`Gemini API error (${response.status}): ${errorText}`);
        if (response.status === 400 || response.status === 403) continue;
        throw lastError;
      }

      const data = await response.json();
      return parseGeminiResponse(data);
    } catch (err) {
      if (err.code === 'NO_API_KEY') throw err;
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All Gemini model attempts failed.');
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
