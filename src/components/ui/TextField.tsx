import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TextFieldProps extends
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  className?: string;
}

export function TextField({
  label,
  error,
  type = 'text',
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && revealed ? 'text' : type;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-muted-foreground">
        
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface px-3.5 text-[15px] text-foreground',
            'placeholder:text-muted-foreground/70',
            'transition-all duration-200 ease-ios',
            'focus:outline-none focus:ring-[3px] focus:ring-ring/40 focus:border-ring',
            isPassword && 'pr-11',
            error ? 'border-destructive' : 'border-border'
          )}
          {...props} />
        
        {isPassword &&
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          
            {revealed ?
          <EyeOff className="h-4 w-4" aria-hidden="true" /> :

          <Eye className="h-4 w-4" aria-hidden="true" />
          }
          </button>
        }
      </div>
      {error &&
      <p id={`${id}-error`} className="text-[12px] text-destructive">
          {error}
        </p>
      }
    </div>);

}