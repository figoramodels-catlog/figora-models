import React from 'react';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  available: boolean;
  className?: string;
}

export function StatusBadge({ available, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[11px] font-medium tracking-[-0.01em]',
        available ?
        'border-success/30 bg-success/10 text-success' :
        'border-border bg-muted text-muted-foreground',
        className
      )}>
      
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          available ? 'bg-success' : 'bg-muted-foreground'
        )} />
      
      {available ? 'Available' : 'Out of Stock'}
    </span>);

}