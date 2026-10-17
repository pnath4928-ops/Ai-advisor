import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { OmitMotionEventProps } from '@/lib/motion';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<{ value?: string; onValueChange?: (value: string) => void }>({});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 rounded-xl bg-surface-secondary p-1 border border-border',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value: triggerValue, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context.value === triggerValue;

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer',
          isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary',
          className
        )}
        onClick={() => context.onValueChange?.(triggerValue)}
        {...props}
      >
        {isActive && (
          <motion.span
            layoutId="tabsPill"
            className="absolute inset-0 rounded-lg bg-primary/15 shadow-sm"
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <span className="relative z-10">{props.children}</span>
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  HTMLDivElement,
  OmitMotionEventProps<React.HTMLAttributes<HTMLDivElement>> & { value: string }
>(({ className, value: contentValue, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (context.value !== contentValue) return null;

  return (
    <motion.div
      ref={ref}
      className={cn('mt-4 focus-visible:outline-none', className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
