import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[95] grid place-items-center p-5">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
        
          <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-lift">
          
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em]">
              {title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
              variant="primary"
              className="flex-1"
              onClick={onConfirm}
              autoFocus>
              
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}