import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Palette, Sofa, Sparkles, ArrowUpRight } from 'lucide-react';

const cards = [
  {
    title: 'AI Color Scheme',
    subtitle: 'Visualizer',
    description: 'Detect walls with AI precision. Visualize paint colors in real-time with texture-preserving blend technology.',
    icon: Palette,
    path: '/color-visualizer',
    gradient: 'from-champagne to-almond',
    accent: 'text-mocha',
  },
  {
    title: 'AI Furniture',
    subtitle: 'Placement',
    description: 'Drag, drop, resize, and rotate realistic furniture pieces. Design your space with Pinterest-inspired freedom.',
    icon: Sofa,
    path: '/furniture-placement',
    gradient: 'from-cloudy to-dusty',
    accent: 'text-slateblue',
  },
  {
    title: 'AI Theme',
    subtitle: 'Recommendation',
    description: 'Gemini Vision analyzes your room and recommends a complete design theme with curated palette and decor.',
    icon: Sparkles,
    path: '/theme-recommendation',
    gradient: 'from-almond to-champagne',
    accent: 'text-mocha',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16 md:mb-20"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-taupe/60 mb-4">Curated by AI · Designed for you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
        {cards.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2 + i * 0.15,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              y: -12,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(card.path)}
            className="group relative text-left"
          >
            <div className="glass rounded-3xl p-8 md:p-10 shadow-luxe group-hover:shadow-luxe-lg transition-shadow duration-500 h-full overflow-hidden">
              <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${card.gradient} rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-luxe mb-6`}>
                  <card.icon size={26} className={card.accent} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-espresso leading-tight">
                  {card.title}
                  <span className="block text-taupe text-xl md:text-2xl font-light">{card.subtitle}</span>
                </h3>
                <p className="mt-4 text-sm text-taupe leading-relaxed">
                  {card.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-espresso group-hover:gap-3 transition-all duration-300">
                  <span>Begin</span>
                  <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-16 text-xs text-taupe/40 tracking-wide"
      >
        Powered by Gemini Vision AI
      </motion.p>
    </div>
  );
}
