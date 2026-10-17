import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/15 text-primary border-primary/20',
      secondary: 'bg-surface-secondary text-text-secondary border-border',
      success: 'bg-success-subtle text-success border-success/20',
      warning: 'bg-warning-subtle text-warning border-warning/20',
      danger: 'bg-danger-subtle text-danger border-danger/20',
      info: 'bg-info-subtle text-info border-info/20',
      outline: 'bg-transparent text-text-secondary border-border',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
