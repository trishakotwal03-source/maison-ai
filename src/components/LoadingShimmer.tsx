import { motion } from 'framer-motion';

interface LoadingShimmerProps {
  message: string;
  submessage?: string;
}

export default function LoadingShimmer({ message, submessage }: LoadingShimmerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-2 border-champagne border-t-mocha mb-6"
      />
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-display text-2xl text-espresso mb-2"
      >
        {message}
      </motion.h3>
      {submessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-taupe text-sm"
        >
          {submessage}
        </motion.p>
      )}
      <div className="mt-8 w-64 space-y-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-3 rounded-full bg-almond/40 animate-shimmer"
            initial={{ width: '60%' }}
            animate={{ width: ['60%', '100%', '60%'] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
