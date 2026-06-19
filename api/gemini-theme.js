import { callGemini, setCorsHeaders, handleOptions } from './gemini-helper.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const prompt = `You are a world-class interior designer featured in Architectural Digest.

Analyze this room image considering: lighting, furniture, room size, wall colors, flooring, architecture, aesthetic, decor, and composition.

Recommend the SINGLE MOST suitable design theme for transforming this space. Be specific to THIS room.

Consider: Scandinavian, Japandi, Minimalist, Industrial, Contemporary, Modern Luxury, Bohemian, Rustic, French Country, Mediterranean, Traditional, Art Deco, Eclectic, Coastal, Transitional, Organic Modern, Hollywood Regency, Urban Modern, Wabi Sabi, Luxury Hotel, Mid Century, Farmhouse.

Return ONLY a JSON object (no markdown, no code fences):
{
  "theme": "Theme Name",
  "description": "2-3 paragraphs explaining why this theme suits this specific room",
  "palette": [{"name": "Color Name", "hex": "#XXXXXX"}],
  "furniture": ["piece 1", "piece 2", "piece 3", "piece 4", "piece 5"],
  "decor": ["idea 1", "idea 2", "idea 3", "idea 4"],
  "lighting": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "curtains": "Specific curtain recommendation",
  "wallArt": "Specific wall art recommendation",
  "plants": "Specific plant recommendation",
  "textures": ["texture 1", "texture 2", "texture 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4"]
}

Keep each array item concise (1 sentence max). Keep description to 2-3 sentences per paragraph.`;

    const result = await callGemini(prompt, image, mimeType, {
      temperature: 0.7,
      maxOutputTokens: 16384,
    });

    // Validate and fill any missing fields
    const validated = {
      theme: result.theme || 'Contemporary',
      description: result.description || 'A beautiful design theme that complements your space.',
      palette: Array.isArray(result.palette) ? result.palette.map(c => ({
        name: c.name || 'Color',
        hex: /^#[0-9A-Fa-f]{6}$/.test(c.hex) ? c.hex : '#D8CFC4',
      })) : [],
      furniture: Array.isArray(result.furniture) ? result.furniture : [],
      decor: Array.isArray(result.decor) ? result.decor : [],
      lighting: Array.isArray(result.lighting) ? result.lighting : [],
      curtains: result.curtains || 'Sheer linen curtains in a warm neutral tone.',
      wallArt: result.wallArt || 'A large-scale abstract print in muted earth tones.',
      plants: result.plants || 'A fiddle leaf fig or snake plant suited to the lighting.',
      textures: Array.isArray(result.textures) ? result.textures : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
    };

    return res.status(200).json(validated);
  } catch (err) {
    console.error('Theme recommendation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze room. Please try again.' });
  }
}
