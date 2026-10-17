import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { OmitMotionEventProps } from '@/lib/motion';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-[box-shadow,background-color,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer will-change-transform',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white hover:bg-primary-hover shadow-[0_2px_12px_rgba(124,92,255,0.3)] hover:shadow-[0_4px_20px_rgba(124,92,255,0.4)]',
        destructive:
          'bg-danger text-white hover:bg-danger/90 shadow-[0_2px_12px_rgba(239,68,68,0.2)]',
        outline:
          'border border-border bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary hover:border-border-hover',
        secondary:
          'bg-surface-secondary text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border',
        ghost:
          'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-sm',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends OmitMotionEventProps<React.ButtonHTMLAttributes<HTMLButtonElement>>,
    VariantProps<typeof buttonVariants> {}

const MotionButton = motion.button;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const isLink = variant === 'link';
    return (
      <MotionButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={isLink ? undefined : { scale: 1.03 }}
        whileTap={isLink ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
