import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { buildOrderMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import type { Product } from '../types';

interface CartLine {
  product: Product;
  quantity: number;
}

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, remove, clear, totalQuantity } =
  useCart();
  const { getById } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  const lines = useMemo<CartLine[]>(() => {
    const result: CartLine[] = [];
    items.forEach((item) => {
      const product = getById(item.productId);
      if (product) result.push({ product, quantity: item.quantity });
    });
    return result;
  }, [items, getById]);

  const sendOrder = () => {
    if (!user || lines.length === 0) return;
    const message = buildOrderMessage(
      { fullName: user.fullName, email: user.email },
      lines
    );
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen &&
        <div className="fixed inset-0 z-[70] flex justify-end">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          
            <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-lift">
            
              <header className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em]">
                    Cart
                  </h2>
                  <p className="tabular text-[12px] text-muted-foreground">
                    {totalQuantity} item{totalQuantity === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {lines.length === 0 ?
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-surface">
                      <ShoppingBag
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true" />
                  
                    </div>
                    <p className="text-[14px] font-medium">Your cart is empty</p>
                    <p className="max-w-[220px] text-[13px] text-muted-foreground">
                      Add models from the collection to send an order.
                    </p>
                    <Button variant="secondary" onClick={closeCart}>
                      Browse Collection
                    </Button>
                  </div> :

              <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {lines.map(({ product, quantity }) =>
                  <motion.li
                    key={product!.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
                    
                          <div className="h-[84px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-image">
                            <img
                        src={product!.image}
                        alt={product!.name}
                        className="h-full w-full object-cover" />
                      
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
                              {product!.name}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {product!.productId}
                            </p>
                            <div className="mt-auto flex items-center gap-2">
                              <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
                                <button
                            type="button"
                            onClick={() =>
                            setQuantity(product!.id, quantity - 1)
                            }
                            aria-label={`Decrease quantity of ${product!.name}`}
                            className="grid h-7 w-7 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            
                                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                                <span className="tabular w-6 text-center text-[13px] font-medium">
                                  {quantity}
                                </span>
                                <button
                            type="button"
                            onClick={() =>
                            setQuantity(product!.id, quantity + 1)
                            }
                            aria-label={`Increase quantity of ${product!.name}`}
                            className="grid h-7 w-7 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            
                                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </div>
                              <button
                          type="button"
                          onClick={() => remove(product!.id)}
                          aria-label={`Remove ${product!.name}`}
                          className="ml-auto grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                  )}
                    </AnimatePresence>
                  </ul>
              }
              </div>

              {lines.length > 0 &&
            <footer className="space-y-2 border-t border-border px-4 py-4">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <span className="text-[13px] text-muted-foreground">
                      Total Items
                    </span>
                    <span className="tabular text-[15px] font-semibold">
                      {totalQuantity}
                    </span>
                  </div>
                  {user ?
              <Button size="lg" className="w-full" onClick={sendOrder}>
                      Send Order via WhatsApp
                    </Button> :

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  closeCart();
                  navigate('/login');
                }}>
                
                      Sign in to Send Order
                    </Button>
              }
                  <Button
                variant="danger"
                size="lg"
                className="w-full"
                onClick={() => setConfirmClear(true)}>
                
                    Clear Cart
                  </Button>
                </footer>
            }
            </motion.aside>
          </div>
        }
      </AnimatePresence>

      <ConfirmDialog
        open={confirmClear}
        title="Clear cart?"
        description="This removes every model from your cart. It can't be undone."
        confirmLabel="Clear Cart"
        onConfirm={() => {
          clear();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)} />
      
    </>);

}