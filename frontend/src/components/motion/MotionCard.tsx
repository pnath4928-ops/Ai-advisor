import { motion } from 'framer-motion';
import type { HTMLAttributes, ReactNode } from 'react';
import type { OmitMotionEventProps } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface MotionCardProps extends OmitMotionEventProps<HTMLAttributes<HTMLDivElement>> {
  children: ReactNode;
  lift?: boolean;
}

const baseClasses =
  'rounded-2xl bg-surface/60 backdrop-blur-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_32px_rgba(0,0,0,0.12)]';

export function MotionCard({ children, className, lift = true, ...props }: MotionCardProps) {
  return (
    <motion.div
      className={cn(
        baseClasses,
        'transition-[box-shadow,border-color] duration-300 hover:border-border-hover',
        lift && 'hover:shadow-[0_2px_6px_rgba(0,0,0,0.25),0_18px_48px_rgba(0,0,0,0.22)]',
        className
      )}
      whileHover={lift ? { y: -4, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
