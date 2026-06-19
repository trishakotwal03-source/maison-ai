# Maison AI — Luxury Interior Design

A Pinterest-level, luxury editorial AI Interior Design web application powered by Gemini Vision.

## Features

### 1. AI Color Scheme Visualizer
Upload a room photo and Gemini Vision detects wall regions with semantic understanding. Apply new paint colors with realistic multiply blending that preserves texture, lighting, and wall details. Includes a luxury questionnaire for context-aware palette recommendations, before/after slider, undo/redo, opacity control, and high-resolution export.

### 2. AI Furniture Placement
Drag, drop, resize, rotate, and layer realistic transparent PNG furniture pieces over your room image. Includes shadow rendering, layer ordering, duplicate/delete, and composition export.

### 3. AI Theme Recommendation
Gemini Vision analyzes your room's lighting, furniture, architecture, and composition to recommend the most suitable design theme with a complete design plan including palette, furniture, decor, lighting, curtains, wall art, plants, textures, and improvements.

## Tech Stack

- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Vercel Serverless API Routes** (backend)
- **Gemini Vision API** (AI — gemini-2.5-flash)
- **Supabase** (database for saved designs)
- **Lucide Icons**

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your Gemini API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model to use (default: `gemini-2.5-flash`) |

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Furniture Assets

Furniture PNGs are stored in `public/furniture/` organized by category:
```
public/furniture/
  sofas/
  chairs/
  tables/
  beds/
  plants/
  shelves/
  lamps/
  walldecor/
  rugs/
```

To add more furniture:
1. Place transparent PNG files in the appropriate category folder
2. Add entries to `src/lib/furnitureData.ts`

Users can also upload custom PNGs directly through the UI.

## Project Structure

```
src/
  components/     Reusable UI components
  pages/          Route pages (Home, ColorVisualizer, etc.)
  lib/            Utilities, types, data
  App.tsx         Router setup
  index.css       Design system & global styles
api/
  gemini-helper.js   Shared Gemini API utilities
  gemini-walls.js    Wall detection endpoint
  gemini-palette.js  Palette recommendation endpoint
  gemini-theme.js    Theme analysis endpoint
  designs.js         Saved designs CRUD
```

## Design System

- **Primary palette:** Linen Beige, Champagne Cream, Almond Beige, Cloudy Blue Grey, Dusty Pastel Blue
- **Accent palette:** Deep Espresso, Dark Taupe, Slate Blue Grey, Mocha, Muted Charcoal
- **Typography:** Cormorant Garamond (display) + Inter (body)
- **Visual style:** Glassmorphism, floating cards, large rounded corners, backdrop blur, layered shadows, soft gradients, editorial spacing
