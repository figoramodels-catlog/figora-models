import React from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

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
  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title={product?.name ?? 'Product'}
      hideTitle
      className="sm:max-w-3xl">
      
      {product &&
      <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
          <div className="bg-image">
            <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover" />
          
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {product.category}
              </span>
              <h3 className="font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] sm:text-[24px]">
                {product.name}
              </h3>
              <p className="font-mono text-[12px] text-muted-foreground">
                {product.productId}
              </p>
            </div>

            <StatusBadge available={product.available} className="w-fit" />

            <p className="text-[14px] leading-relaxed text-muted-foreground">
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
    </Modal>);

}