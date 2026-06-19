import { callGemini, setCorsHeaders, handleOptions } from './gemini-helper.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mimeType, width, height, retry } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // PASS 1: Semantic room understanding — describe walls in detail
    const analysisPrompt = `You are an expert interior architect analyzing a room photo for wall painting.

First, carefully study the image and identify every visible wall surface. Think step by step:

1. How many distinct wall planes are visible? (Most rooms show 2-4 walls due to perspective.)
2. For each wall, where does it start and end? Look for:
   - Wall-to-wall corners (where two walls meet at an angle)
   - Wall-to-ceiling boundary (top edge)
   - Wall-to-floor boundary (bottom edge)
   - Wall-to-door/window boundaries
3. Are there any architectural features on the walls? (Fireplaces, built-in shelves, columns, niches)
4. What is the perspective angle? (Straight-on, slightly angled, significantly angled)

CRITICAL — identify ONLY wall surfaces. Do NOT include:
- Ceilings or ceiling areas
- Floors or floor areas
- Furniture (sofas, chairs, tables, beds, etc.)
- Windows (the glass and frame, but DO include the wall around them)
- Doors (the door itself, but DO include the wall around them)
- Curtains, blinds
- Wall art, paintings, mirrors, frames (exclude these objects but include the wall behind them)
- Plants, decorations, lamps
- Shadows or reflections

The image is ${width}x${height} pixels. Coordinates: x goes left(0) to right(${width}), y goes top(0) to bottom(${height}).

Now provide the wall polygons. For EACH wall:
- Use 8-16 points to trace the wall outline precisely
- Trace ALONG the edges of objects that are against the wall (e.g., if a sofa is against the wall, trace around the sofa's silhouette where it touches the wall)
- Include the wall area above doors and windows
- Exclude the actual window/door openings from the polygon
- Make sure polygons cover the FULL wall surface, edge to edge

Return ONLY this JSON:
{
  "wallCount": <number>,
  "walls": [
    {
      "description": "brief description of which wall this is",
      "polygon": [[x1,y1], [x2,y2], ...]
    }
  ]
}

Be generous with wall coverage — it's better to slightly over-include wall area than to miss wall sections. The paint will be blended with texture preservation, so slight over-coverage looks natural.`;

    let result;
    try {
      result = await callGemini(analysisPrompt, image, mimeType, {
        temperature: 0.15,
        maxOutputTokens: 16384,
      });
    } catch (firstErr) {
      // If first attempt fails, try with simpler prompt
      const simplePrompt = `Analyze this room image (${width}x${height} pixels) and identify all visible WALL surfaces only (not floors, ceilings, furniture, or decorations).

For each wall, provide a polygon with 8-16 [x,y] coordinate points tracing the wall outline. x: 0 to ${width}, y: 0 to ${height}.

Return ONLY: {"walls": [{"polygon": [[x1,y1],...]}]}

Include the wall area around windows and doors (exclude the openings). Trace around furniture that touches the wall. Be generous — cover the full wall surface.`;

      result = await callGemini(simplePrompt, image, mimeType, {
        temperature: 0.2,
        maxOutputTokens: 16384,
      });
    }

    if (!result.walls || !Array.isArray(result.walls) || result.walls.length === 0) {
      if (!retry) {
        // Final retry with explicit instruction
        const retryPrompt = `This room image (${width}x${height}) has walls. Identify the LARGEST visible wall surface and trace its outline as a polygon with 8-12 points. Include the full wall from floor to ceiling, left corner to right corner. Return ONLY: {"walls": [{"polygon": [[x,y],...]}]}`;
        const retryResult = await callGemini(retryPrompt, image, mimeType, {
          temperature: 0.3,
          maxOutputTokens: 8192,
        });
        if (retryResult.walls && retryResult.walls.length > 0) {
          const validated = validateAndClean(retryResult.walls, width, height);
          if (validated.length > 0) return res.status(200).json({ walls: validated });
        }
      }
      return res.status(422).json({
        error: 'No walls were detected in the image. Please try a clearer photo of your room with visible walls.',
      });
    }

    const validatedWalls = validateAndClean(result.walls, width, height);

    if (validatedWalls.length === 0) {
      return res.status(422).json({
        error: 'Wall detection produced invalid polygons. Please try a different photo with clearer wall boundaries.',
      });
    }

    // PASS 2: If we only got 1 wall, try to detect additional walls
    if (validatedWalls.length === 1 && !retry) {
      try {
        const additionalPrompt = `Look at this room image (${width}x${height}). I already identified one wall. Now look more carefully — are there OTHER wall surfaces visible? 

Look for:
- Walls at different angles (perspective walls going into the background)
- Wall sections on the left or right side of the image
- Partial walls behind furniture

Return ONLY: {"walls": [{"description": "...", "polygon": [[x,y],...]}]}

If you see additional walls, include them. If the first wall you see is different from what I might have, include ALL walls you can see. Use 8-16 points per polygon.`;

        const additionalResult = await callGemini(additionalPrompt, image, mimeType, {
          temperature: 0.25,
          maxOutputTokens: 16384,
        });

        if (additionalResult.walls && additionalResult.walls.length > 1) {
          const additionalValidated = validateAndClean(additionalResult.walls, width, height);
          if (additionalValidated.length > validatedWalls.length) {
            return res.status(200).json({ walls: additionalValidated });
          }
        }
      } catch {
        // Use the first pass result
      }
    }

    return res.status(200).json({ walls: validatedWalls });
  } catch (err) {
    console.error('Wall detection error:', err);
    return res.status(500).json({ error: err.message || 'Failed to detect walls.' });
  }
}

function validateAndClean(walls, width, height) {
  return walls
    .filter(w => w.polygon && Array.isArray(w.polygon) && w.polygon.length >= 3)
    .map(w => ({
      polygon: w.polygon.map(p => [
        Math.max(0, Math.min(width, Math.round(Array.isArray(p) ? p[0] : p.x || 0))),
        Math.max(0, Math.min(height, Math.round(Array.isArray(p) ? p[1] : p.y || 0))),
      ]),
    }))
    .filter(w => {
      // Filter out degenerate polygons (all same point)
      const pts = w.polygon;
      const xs = pts.map(p => p[0]);
      const ys = pts.map(p => p[1]);
      const range = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
      return range > 100; // At least 100 sq pixels
    });
}
