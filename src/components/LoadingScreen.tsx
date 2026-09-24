import React from 'react';
import { motion } from 'framer-motion';

const brand = 'FIGORA MODELS'.split('');

export function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      role="status"
      aria-label="Loading FIGORA MODELS">
      
      <div className="flex items-center" aria-hidden="true">
        {brand.map((letter, index) =>
        <motion.span
          key={`${letter}-${index}`}
          initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: index * 0.045,
            ease: [0.32, 0.72, 0, 1]
          }}
          className="font-display text-[22px] font-semibold tracking-[0.34em] text-foreground sm:text-[28px]">
          
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        )}
      </div>

      <div className="mt-8 h-[2px] w-40 overflow-hidden rounded-full bg-border sm:w-56">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full bg-foreground" />
        
      </div>

      <span className="mt-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Collection
      </span>
    </motion.div>);

}