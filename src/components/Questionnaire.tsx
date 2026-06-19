import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SkipForward, Check } from 'lucide-react';
import type { QuestionnaireData } from '../lib/types';
import { allStyles } from '../lib/stylePalettes';

interface QuestionnaireProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionnaireData) => void;
  onSkip: () => void;
}

const vibes = ['Cozy', 'Airy', 'Elegant', 'Luxury', 'Warm', 'Minimal', 'Calm', 'Creative'];
const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Dining', 'Bathroom', 'Office'];
const lightingOptions = ['Natural Light', 'Bright & Airy', 'Warm & Dim', 'Cool & Crisp', 'Mixed Lighting', 'Moody & Intimate'];

export default function Questionnaire({ open, onClose, onSubmit, onSkip }: QuestionnaireProps) {
  const [vibe, setVibe] = useState('');
  const [roomType, setRoomType] = useState('');
  const [customRoom, setCustomRoom] = useState('');
  const [favoriteColors, setFavoriteColors] = useState('');
  const [warmCool, setWarmCool] = useState('');
  const [lighting, setLighting] = useState('');
  const [styles, setStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]);
  };

  const handleSubmit = () => {
    onSubmit({
      vibe,
      roomType: customRoom || roomType,
      favoriteColors,
      warmCool,
      lighting,
      styles,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-espresso/30 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-strong rounded-3xl shadow-luxe-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 glass-strong px-8 py-5 flex items-center justify-between border-b border-white/30">
              <div>
                <h2 className="font-display text-2xl text-espresso">Design Preferences</h2>
                <p className="text-xs text-taupe mt-0.5">Help us craft the perfect palette for your space</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSkip}
                  className="flex items-center gap-1.5 text-xs text-taupe hover:text-espresso transition-colors px-3 py-2 rounded-full hover:bg-white/40"
                >
                  <SkipForward size={14} />
                  Skip
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-taupe hover:text-espresso hover:bg-white/40 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-7">
              <div>
                <label className="block text-sm font-medium text-espresso mb-3">Desired Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {vibes.map(v => (
                    <button
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        vibe === v
                          ? 'bg-espresso text-linen shadow-luxe'
                          : 'bg-white/40 text-taupe hover:bg-white/60'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso mb-3">Room Type</label>
                <div className="flex flex-wrap gap-2">
                  {roomTypes.map(r => (
                    <button
                      key={r}
                      onClick={() => { setRoomType(r); setCustomRoom(''); }}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        roomType === r && !customRoom
                          ? 'bg-espresso text-linen shadow-luxe'
                          : 'bg-white/40 text-taupe hover:bg-white/60'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customRoom}
                  onChange={(e) => { setCustomRoom(e.target.value); setRoomType(''); }}
                  placeholder="Or type a custom room type..."
                  className="mt-3 w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/50 text-sm text-espresso placeholder:text-taupe/50 focus:outline-none focus:ring-2 focus:ring-mocha/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-espresso mb-3">Favorite Colors</label>
                  <input
                    type="text"
                    value={favoriteColors}
                    onChange={(e) => setFavoriteColors(e.target.value)}
                    placeholder="e.g., sage green, warm white"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/50 text-sm text-espresso placeholder:text-taupe/50 focus:outline-none focus:ring-2 focus:ring-mocha/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso mb-3">Warm or Cool</label>
                  <div className="flex gap-2">
                    {['Warm', 'Cool'].map(w => (
                      <button
                        key={w}
                        onClick={() => setWarmCool(w)}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all ${
                          warmCool === w
                            ? 'bg-espresso text-linen shadow-luxe'
                            : 'bg-white/40 text-taupe hover:bg-white/60'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso mb-3">Lighting Preference</label>
                <div className="flex flex-wrap gap-2">
                  {lightingOptions.map(l => (
                    <button
                      key={l}
                      onClick={() => setLighting(l)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        lighting === l
                          ? 'bg-espresso text-linen shadow-luxe'
                          : 'bg-white/40 text-taupe hover:bg-white/60'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso mb-1">Preferred Style</label>
                <p className="text-xs text-taupe mb-3">Select multiple styles that appeal to you</p>
                <div className="flex flex-wrap gap-2">
                  {allStyles.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleStyle(s)}
                      className={`px-3.5 py-2 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                        styles.includes(s)
                          ? 'bg-mocha text-linen shadow-luxe'
                          : 'bg-white/40 text-taupe hover:bg-white/60'
                      }`}
                    >
                      {styles.includes(s) && <Check size={12} />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 glass-strong px-8 py-5 border-t border-white/30 flex justify-end gap-3">
              <button
                onClick={onSkip}
                className="px-6 py-2.5 rounded-full text-sm text-taupe hover:text-espresso transition-colors"
              >
                Skip Questionnaire
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-full text-sm bg-espresso text-linen shadow-luxe hover:shadow-luxe-lg transition-all font-medium"
              >
                Generate Palette
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
