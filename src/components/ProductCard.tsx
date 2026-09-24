import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { StatusBadge } from './ui/StatusBadge';
import { cn } from '../utils/cn';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onOpen, onAdd }: ProductCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-card',
        'transition-shadow duration-200 ease-ios hover:shadow-lift',
        !product.available && 'opacity-60'
      )}>
      
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`View ${product.name}`}
        className="relative block w-full overflow-hidden bg-image focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        
        <div className="aspect-[4/5] w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[400ms] ease-ios group-hover:scale-[1.03]" />
          
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {product.category}
        </span>
        <h3 className="font-display text-[13px] font-semibold leading-snug tracking-[-0.01em] text-foreground sm:text-[15px]">
          {product.name}
        </h3>
        <p className="font-mono text-[11px] text-muted-foreground">
          {product.productId}
        </p>
        <StatusBadge available={product.available} className="mt-0.5 w-fit" />

        <button
          type="button"
          disabled={!product.available}
          onClick={() => onAdd(product)}
          className={cn(
            'mt-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-medium',
            'transition-all duration-200 ease-ios focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            product.available ?
            'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97]' :
            'cursor-not-allowed border border-border bg-muted text-muted-foreground'
          )}>
          
          {product.available ?
          <>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add to Cart
            </> :

          'Unavailable'
          }
        </button>
      </div>
    </motion.article>);

}