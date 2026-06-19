import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Sofa, Lightbulb, Frame, Leaf, Paintbrush, Wand2 } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import LoadingShimmer from '../components/LoadingShimmer';
import { preprocessImage } from '../lib/imageUtils';
import type { ThemeRecommendation as ThemeResult } from '../lib/types';

export default function ThemeRecommendation() {
  const [stage, setStage] = useState<'upload' | 'loading' | 'results'>('upload');
  const [result, setResult] = useState<ThemeResult | null>(null);
  const [error, setError] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');

  const handleUpload = async (file: File) => {
    setError('');
    try {
      const processed = await preprocessImage(file);
      setImageDataUrl(processed.dataUrl);
      setStage('loading');

      const res = await fetch('/api/gemini-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: processed.base64,
          mimeType: processed.mimeType,
        }),
      });

      const text = await res.text();
      if (!text) throw new Error('The AI returned an empty response. Please try again.');
      
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('The AI response was malformed. Please try a different photo.');
      }

      if (!res.ok) throw new Error(data.error || 'Failed to analyze room');

      const validated: ThemeResult = {
        theme: data.theme || 'Unknown Theme',
        description: data.description || '',
        palette: Array.isArray(data.palette) ? data.palette : [],
        furniture: Array.isArray(data.furniture) ? data.furniture : [],
        decor: Array.isArray(data.decor) ? data.decor : [],
        lighting: Array.isArray(data.lighting) ? data.lighting : [],
        curtains: data.curtains || '',
        wallArt: data.wallArt || '',
        plants: data.plants || '',
        textures: Array.isArray(data.textures) ? data.textures : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
      };
      setResult(validated);
      setStage('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze room. Please ensure your Gemini API key is configured.');
      setStage('upload');
    }
  };

  const reset = () => {
    setStage('upload');
    setResult(null);
    setError('');
    setImageDataUrl('');
  };

  if (stage === 'upload') {
    return (
      <>
        <UploadZone
          onUpload={handleUpload}
          title="AI Theme Recommendation"
          description="Upload a photo of your room and Gemini Vision will analyze every detail to recommend the perfect design theme with a complete styling plan."
        />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-5 py-3 shadow-luxe flex items-center gap-2 text-sm text-mocha max-w-md">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}
      </>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <LoadingShimmer
          message="Analyzing your room..."
          submessage="Gemini Vision is examining lighting, furniture, architecture, and composition"
        />
      </div>
    );
  }

  if (!result) return null;

  const sectionIcons = {
    furniture: Sofa,
    decor: Frame,
    lighting: Lightbulb,
    textures: Paintbrush,
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-taupe/60 mb-3">Recommended Theme</p>
          <h1 className="font-display text-4xl md:text-6xl text-espresso mb-4 text-balance">{result.theme}</h1>
          <div className="w-16 h-px bg-mocha mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl overflow-hidden shadow-luxe-lg mb-10 max-w-2xl mx-auto"
        >
          <img src={imageDataUrl} className="w-full h-auto" alt="Your room" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-8 md:p-10 shadow-luxe mb-8"
        >
          <p className="text-base md:text-lg text-espresso leading-relaxed whitespace-pre-line">{result.description}</p>
        </motion.div>

        {result.palette.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl text-espresso mb-4">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {result.palette.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded-2xl overflow-hidden shadow-luxe"
                >
                  <div className="h-20" style={{ backgroundColor: c.hex }} />
                  <div className="p-3 bg-white/50">
                    <p className="text-sm font-medium text-espresso">{c.name}</p>
                    <p className="text-xs text-taupe">{c.hex}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {([
            { key: 'furniture', title: 'Furniture', items: result.furniture },
            { key: 'decor', title: 'Decor Ideas', items: result.decor },
            { key: 'lighting', title: 'Lighting', items: result.lighting },
            { key: 'textures', title: 'Textures', items: result.textures },
          ] as const).map((section, i) => {
            const Icon = sectionIcons[section.key];
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-strong rounded-3xl p-6 shadow-luxe"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-champagne to-almond flex items-center justify-center">
                    <Icon size={18} className="text-mocha" />
                  </div>
                  <h3 className="font-display text-xl text-espresso">{section.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-espresso">
                      <span className="w-1.5 h-1.5 rounded-full bg-mocha flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {([
            { title: 'Curtains', text: result.curtains, icon: Frame },
            { title: 'Wall Art', text: result.wallArt, icon: Paintbrush },
            { title: 'Plants', text: result.plants, icon: Leaf },
          ] as const).map((callout, i) => (
            <motion.div
              key={callout.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-strong rounded-2xl p-5 shadow-luxe"
            >
              <div className="flex items-center gap-2 mb-3">
                <callout.icon size={16} className="text-mocha" />
                <h4 className="text-sm font-medium text-espresso">{callout.title}</h4>
              </div>
              <p className="text-sm text-taupe leading-relaxed">{callout.text}</p>
            </motion.div>
          ))}
        </div>

        {result.improvements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-strong rounded-3xl p-8 shadow-luxe mb-8"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cloudy to-dusty flex items-center justify-center">
                <Wand2 size={18} className="text-slateblue" />
              </div>
              <h2 className="font-display text-2xl text-espresso">Suggested Improvements</h2>
            </div>
            <ul className="space-y-3">
              {result.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-mocha/20 flex items-center justify-center text-xs text-mocha flex-shrink-0 mt-0.5 font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm text-espresso leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <div className="text-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso text-linen shadow-luxe hover:shadow-luxe-lg transition-all text-sm font-medium"
          >
            <RotateCcw size={16} />
            Analyze Another Room
          </button>
        </div>
      </div>
    </div>
  );
}
