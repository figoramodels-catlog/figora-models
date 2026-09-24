import React from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
  'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 border border-transparent',
  secondary:
  'bg-secondary text-secondary-foreground border border-border hover:bg-accent',
  ghost:
  'bg-transparent text-foreground border border-transparent hover:bg-accent',
  danger:
  'bg-transparent text-destructive border border-border hover:bg-destructive/10'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-xl',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-[15px] rounded-2xl'
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-medium tracking-[-0.01em]',
        'transition-all duration-200 ease-ios active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className
      )}
      {...props} />);


}