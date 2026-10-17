import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CompletionAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function CompletionAnimation({ show, onComplete }: CompletionAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);

      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#7C5CFF', '#5CA8FF', '#5CFFB4'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#7C5CFF', '#5CA8FF', '#5CFFB4'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.6 }}
                />
                <motion.path
                  d="M30 50 l15 15 l25 -30"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.4, delay: 0.4 }}
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">
              Congratulations!
            </h2>
            <p className="text-white/80 text-center max-w-sm">
              You completed today's study goal.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
