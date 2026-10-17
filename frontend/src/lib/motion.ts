import type { Transition, Variants } from 'framer-motion';

export type OmitMotionEventProps<T> = Omit<
  T,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

export const DUR = {
  fast: 150,
  normal: 250,
  slow: 350,
  large: 450,
};

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const easeOut: Transition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: DUR.slow / 1000,
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const staggerItem: Variants = fadeUp;

export const bellPulse: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.75, 1],
    transition: { duration: 1.2, repeat: Infinity, repeatDelay: 4 },
  },
};

export const floatY: Variants = {
  idle: { y: 0 },
  float: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const softPulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.04, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const shake: Variants = {
  hidden: { opacity: 0, x: 0 },
  visible: {
    opacity: 1,
    x: [0, -8, 8, -5, 5, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
