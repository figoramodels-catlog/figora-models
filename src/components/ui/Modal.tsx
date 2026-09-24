import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hide the title visually but keep it for assistive tech */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  className
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
        
          <motion.div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            'relative z-10 max-h-[92vh] w-full overflow-y-auto border border-border bg-card shadow-lift outline-none',
            'rounded-t-3xl sm:max-w-lg sm:rounded-3xl',
            className
          )}>
          
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card/90 px-5 py-4 backdrop-blur">
              <h2
              className={cn(
                'font-display text-[17px] font-semibold tracking-[-0.02em]',
                hideTitle && 'sr-only'
              )}>
              
                {title}
              </h2>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}