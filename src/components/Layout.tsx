import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-linen via-champagne to-cloudy animate-gradient" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-dusty/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-almond/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => navigate('/')} className="transition-transform hover:scale-[1.02]">
            <Logo />
          </button>
          <AnimatePresence>
            {!isHome && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => navigate('/')}
                className="glass rounded-full px-4 py-2 flex items-center gap-2 text-sm text-espresso shadow-luxe hover:shadow-luxe-lg transition-all"
              >
                <ArrowLeft size={16} />
                <span>Home</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
