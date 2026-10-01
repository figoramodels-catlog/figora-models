import { useState, useEffect } from 'react';
import { Plus, X, ZoomIn } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';
import { cn } from '../utils/cn';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAdd
}: ProductDetailModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    setActiveIdx(0);
  }, [product]);

  const images = product ? (product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])) : [];

  return (
    <>
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title={product?.name ?? 'Product'}
      hideTitle
      className="sm:max-w-3xl">
      
      {product &&
      <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-border/40 bg-surface">
            <div className="relative w-full shrink-0 group">
              <button 
                type="button"
                onClick={() => setIsFullScreen(true)}
                className="w-full text-left relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <motion.img
                  layoutId={`lightbox-${product.id}`}
                  src={images[activeIdx]}
                  alt={`${product.name} - view`}
                  className="aspect-[4/5] w-full object-cover"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur-md text-black opacity-0 transition-all duration-200 group-hover:opacity-100 shadow-md ring-1 ring-black/10 hover:scale-105 hover:bg-white">
                  <ZoomIn className="h-4 w-4" />
                </div>
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar border-t border-border/40 bg-card">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={cn(
                      "h-20 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ease-ios",
                      activeIdx === idx ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {product.category}
              </span>
              <h3 className="font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]">
                {product.name}
              </h3>
              <p className="font-mono text-[12px] text-muted-foreground">
                {product.productId}
              </p>
            </div>
            
            <div className="mt-2 flex items-center justify-between rounded-2xl bg-surface/50 p-4 border border-border/50">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-muted-foreground">Price</span>
                <p className="font-mono text-[24px] font-bold text-foreground sm:text-[28px]">
                  LKR {(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <StatusBadge available={product.available} className="w-fit" />
            </div>

            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <Button
              size="lg"
              disabled={!product.available}
              onClick={() => onAdd(product)}>
              
                {product.available ?
              <>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add to Cart
                  </> :

              'Out of Stock'
              }
              </Button>
              <Button variant="secondary" size="lg" onClick={onClose}>
                Back to Collection
              </Button>
            </div>
          </div>
        </div>
      }
    </Modal>
    
    <AnimatePresence>
      {isFullScreen && product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="absolute right-4 top-4 sm:right-8 sm:top-8 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <X className="h-6 w-6" />
          </button>
          
          <motion.img
            layoutId={`lightbox-${product.id}`}
            src={images[activeIdx]}
            alt={product?.name}
            className="max-h-[90vh] max-w-full object-contain drop-shadow-2xl"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );

}