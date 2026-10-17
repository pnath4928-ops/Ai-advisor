import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export function Avatar({ name, className, size = 'md' }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SA';

  return (
    <motion.div
      className={cn(
        'rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold shadow-[0_0_0_0_rgba(124,92,255,0)]',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05, boxShadow: '0 0 18px rgba(124,92,255,0.35)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span>{initials}</span>
    </motion.div>
  );
}
