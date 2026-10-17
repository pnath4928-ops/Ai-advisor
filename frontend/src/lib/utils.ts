import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function populatedName(ref: unknown, fallback = 'Unknown'): string {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    const name = (ref as { name?: unknown }).name;
    if (name) return String(name);
  }
  return fallback;
}

export function populatedEmail(ref: unknown): string {
  if (ref && typeof ref === 'object' && 'email' in ref) {
    const email = (ref as { email?: unknown }).email;
    if (email) return String(email);
  }
  return '';
}
