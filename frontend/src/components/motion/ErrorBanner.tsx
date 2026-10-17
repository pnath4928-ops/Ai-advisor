import { AnimatePresence, motion } from 'framer-motion';
import { shake } from '@/lib/motion';

interface ErrorBannerProps {
  message?: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          className="p-3 text-sm text-danger bg-danger-subtle border border-danger/20 rounded-xl"
          variants={shake}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
