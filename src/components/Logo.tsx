import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="select-none"
    >
      <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-espresso via-mocha to-espresso flex items-center justify-center shadow-luxe overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
          <path
            d="M4 20V9C4 7.5 5 6 6.5 6H10V20"
            stroke="#F7F2EC"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20V11C14 9.5 15 8 16.5 8H20V20"
            stroke="#F4EBDD"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 20H21"
            stroke="#F7F2EC"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="7" cy="3.5" r="1.2" fill="#CBD8E6" />
          <path
            d="M7 4.7V6"
            stroke="#CBD8E6"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
