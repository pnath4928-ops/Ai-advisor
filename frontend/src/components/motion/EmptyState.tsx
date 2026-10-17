import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { floatY, softPulse } from '@/lib/motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`flex flex-col items-center justify-center py-8 text-center ${className ?? ''}`}>
      <motion.div
        className="p-3 rounded-2xl bg-surface-secondary mb-3"
        variants={floatY}
        initial={reduceMotion ? undefined : 'idle'}
        animate={reduceMotion ? undefined : 'float'}
      >
        {icon}
      </motion.div>
      <p className="text-sm text-text-secondary">{title}</p>
      {description && <p className="text-xs text-text-tertiary mt-1 max-w-xs">{description}</p>}
      {action && (
        <motion.div
          className="mt-3"
          variants={softPulse}
          initial={reduceMotion ? undefined : 'idle'}
          animate={reduceMotion ? undefined : 'pulse'}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
