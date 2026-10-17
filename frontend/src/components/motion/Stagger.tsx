import { motion } from 'framer-motion';
import type { HTMLAttributes, ReactNode } from 'react';
import { staggerItem } from '@/lib/motion';
import type { OmitMotionEventProps } from '@/lib/motion';

interface StaggerContainerProps extends OmitMotionEventProps<HTMLAttributes<HTMLDivElement>> {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0.05,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends OmitMotionEventProps<HTMLAttributes<HTMLDivElement>> {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}
