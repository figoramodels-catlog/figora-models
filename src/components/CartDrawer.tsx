import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { buildOrderMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

interface CartLine {
  product: Product;
  quantity: number;
}

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, remove, clear, totalQuantity } = useCart();
  const { getById } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [confirmClear, setConfirmClear] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState<string | null>(null);

  const lines = useMemo<CartLine[]>(() => {
    const result: CartLine[] = [];
    items.forEach((item) => {
      const product = getById(item.productId);
      if (product) result.push({ product, quantity: item.quantity });
    });
    return result;
  }, [items, getById]);

  const handleClose = () => {
    setSuccessReference(null);
    closeCart();
  };

  const sendOrder = async () => {
    if (!user || lines.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const reference = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          reference,
          customer_name: user.fullName,
          customer_email: user.email,
          customer_phone: phone || null,
          total_items: totalItems,
          status: 'new'
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = lines.map(line => ({
        order_id: orderData.id,
        product_id: line.product.productId,
        product_name: line.product.name,
        price: line.product.price,
        quantity: line.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      if (phone) {
        try {
          const { error: profileError } = await supabase.from('profiles').update({ phone }).eq('id', user.id).is('phone', null);
          if (profileError) console.warn("Failed to update profile phone:", profileError);
        } catch (e) {
          console.warn("Exception updating profile phone:", e);
        }
      }

      setSuccessReference(reference);
      
      const message = buildOrderMessage(
        reference,
        { fullName: user.fullName, email: user.email, phone },
        lines
      );
      window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
      
      clear();
    } catch (error: any) {
      console.error("Order failed:", error);
      alert(`Failed to place order. Error: ${error?.message || JSON.stringify(error)}\n\nDid you run the SQL migration?`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
          
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Cart"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-lift"
            >
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
                  onClick={handleClose}
                  aria-label="Close cart"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </header>

              {successReference ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-display text-[20px] font-semibold">Order Placed!</h3>
                  <p className="mb-6 max-w-[260px] text-[14px] text-muted-foreground">
                    Your reference is <strong>{successReference}</strong>. We've opened WhatsApp to complete your order.
                  </p>
                  <Button onClick={handleClose}>Continue Shopping</Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {lines.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                        <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-surface">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <p className="text-[14px] font-medium">Your cart is empty</p>
                        <p className="max-w-[220px] text-[13px] text-muted-foreground">
                          Add models from the collection to send an order.
                        </p>
                        <Button variant="secondary" onClick={handleClose}>
                          Browse Collection
                        </Button>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        <AnimatePresence initial={false}>
                          {lines.map(({ product, quantity }) => (
                            <motion.li
                              key={product!.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 24 }}
                              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                              className="flex gap-3 rounded-2xl border border-border bg-surface p-3"
                            >
                              <div className="h-[84px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-image">
                                <img
                                  src={product!.image}
                                  alt={product!.name}
                                  className="h-full w-full object-cover"
                                />
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
                                      onClick={() => setQuantity(product!.id, quantity - 1)}
                                      aria-label={`Decrease quantity of ${product!.name}`}
                                      className="grid h-7 w-7 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                    <span className="tabular w-6 text-center text-[13px] font-medium">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setQuantity(product!.id, quantity + 1)}
                                      aria-label={`Increase quantity of ${product!.name}`}
                                      className="grid h-7 w-7 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => remove(product!.id)}
                                    aria-label={`Remove ${product!.name}`}
                                    className="ml-auto grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>

                  {lines.length > 0 && (
                    <footer className="space-y-4 border-t border-border px-4 py-4">
                      {user && (
                        <div>
                          <label htmlFor="phone" className="mb-1.5 block text-[12px] font-medium text-foreground">
                            Phone Number (Optional)
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-all focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between px-1 pb-1">
                        <span className="text-[13px] text-muted-foreground">Total Items</span>
                        <span className="tabular text-[15px] font-semibold">{totalQuantity}</span>
                      </div>
                      {user ? (
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={sendOrder}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Processing...' : 'Place Order via WhatsApp'}
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={() => {
                            closeCart();
                            navigate('/login');
                          }}
                        >
                          Sign in to Place Order
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="lg"
                        className="w-full"
                        onClick={() => setConfirmClear(true)}
                        disabled={isSubmitting}
                      >
                        Clear Cart
                      </Button>
                    </footer>
                  )}
                </>
              )}
            </motion.aside>
          </div>
        )}
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
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}