import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { OmitMotionEventProps } from '@/lib/motion';

export interface InputProps
  extends OmitMotionEventProps<React.InputHTMLAttributes<HTMLInputElement>> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-[box-shadow,border-color,background-color] duration-200 will-change-transform',
          className
        )}
        ref={ref}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
