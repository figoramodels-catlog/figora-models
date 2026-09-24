import React from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export function Switch({ checked, onChange, label, id }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[30px] w-[50px] shrink-0 rounded-full border transition-colors duration-200 ease-ios',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'border-transparent bg-success' : 'border-border bg-muted'
      )}>
      
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white shadow-soft transition-all duration-200 ease-ios',
          checked ? 'left-[23px]' : 'left-[2px]'
        )} />
      
    </button>);

}