import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { OmitMotionEventProps } from '@/lib/motion';

interface SkeletonProps extends OmitMotionEventProps<React.HTMLAttributes<HTMLDivElement>> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

function Skeleton({ className, variant = 'text', width, height, ...props }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded-lg',
    circular: 'h-10 w-10 rounded-full',
    rectangular: 'h-32 w-full rounded-xl',
  };

  return (
    <motion.div
      className={cn(
        'bg-surface-secondary animate-shimmer',
        variants[variant],
        className
      )}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    />
  );
}

export { Skeleton };
