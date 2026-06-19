import { callGemini, setCorsHeaders, handleOptions } from './gemini-helper.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mimeType, questionnaire } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const prefs = questionnaire || {};
    const prompt = `You are an expert interior designer and color specialist with decades of experience in luxury residential design.

Analyze this room image and recommend a cohesive, sophisticated color palette for the WALLS based on the user's preferences.

User preferences:
- Desired vibe: ${prefs.vibe || 'Not specified'}
- Room type: ${prefs.roomType || 'Not specified'}
- Favorite colors: ${prefs.favoriteColors || 'Not specified'}
- Warm or cool preference: ${prefs.warmCool || 'No preference'}
- Lighting preference: ${prefs.lighting || 'Not specified'}
- Preferred styles: ${(prefs.styles || []).join(', ') || 'Not specified'}

RULES:
- Recommend exactly 6 colors that work together as a professional palette.
- Colors must be appropriate for the selected style(s) and make professional interior design sense.
- NEVER suggest bright, neon, or overly saturated colors.
- All colors should be sophisticated, muted, elegant, and livable.
- Consider the room's existing lighting, furniture, flooring, and architectural elements.
- Each color must have a descriptive name and a hex value.
- If the user specified favorite colors, incorporate compatible versions of them.
- If the user prefers warm tones, lean toward warm neutrals and earth tones.
- If the user prefers cool tones, lean toward cool greys, blues, and greens.

Return ONLY a JSON object with this exact structure:
{
  "palette": [
    { "name": "Descriptive Color Name", "hex": "#XXXXXX" }
  ]
}`;

    const result = await callGemini(prompt, image, mimeType, {
      temperature: 0.6,
      maxOutputTokens: 4096,
    });

    if (!result.palette || !Array.isArray(result.palette)) {
      return res.status(500).json({ error: 'Failed to generate a color palette.' });
    }

    const validatedPalette = result.palette.map(c => ({
      name: c.name || 'Color',
      hex: /^#[0-9A-Fa-f]{6}$/.test(c.hex) ? c.hex : '#D8CFC4',
    }));

    return res.status(200).json({ palette: validatedPalette });
  } catch (err) {
    console.error('Palette generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate palette.' });
  }
}
