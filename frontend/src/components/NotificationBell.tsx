import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white min-w-[18px] h-[18px] px-1"
            variants={reduceMotion ? undefined : { idle: { scale: 1 }, pulse: { scale: [1, 1.15, 1], opacity: [1, 0.8, 1], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 4 } } }}
            initial={reduceMotion ? undefined : 'idle'}
            animate={reduceMotion ? undefined : 'pulse'}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>
      <AnimatePresence>
        {isOpen && <NotificationPanel key="notifications-panel" onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};
