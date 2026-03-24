import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names with clsx', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('overrides duplicate Tailwind classes with twMerge', () => {
    // twMerge takes the last occurrence, so "text-red-500" wins
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('flex', 'grid')).toBe('grid');
  });

  it('handles conditional classes', () => {
    const flag = true;
    const result = cn('base', flag && 'active', !flag && 'hidden');
    expect(result).toBe('base active');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('merges arrays of class names', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });
});
