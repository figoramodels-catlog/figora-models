import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import type { Order, OrderStatus } from '../../types';

const statuses: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: OrderStatus } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as Order[]);
    } catch (e: any) {
      console.error(e);
      showToast('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: pendingStatusChange.status })
        .eq('id', pendingStatusChange.id);

      if (error) throw error;
      
      setOrders((prev) =>
        prev.map((o) => (o.id === pendingStatusChange.id ? { ...o, status: pendingStatusChange.status } : o))
      );
      if (selectedOrder?.id === pendingStatusChange.id) {
        setSelectedOrder(prev => prev ? { ...prev, status: pendingStatusChange.status } : null);
      }
      showToast('Order status updated');
    } catch (e: any) {
      console.error(e);
      showToast('Failed to update status');
    } finally {
      setPendingStatusChange(null);
    }
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (statusFilter === 'all' || o.status === statusFilter) &&
        (!needle ||
          o.reference.toLowerCase().includes(needle) ||
          o.customer_name.toLowerCase().includes(needle) ||
          o.customer_email.toLowerCase().includes(needle))
    );
  }, [orders, query, statusFilter]);

  const statusColors: Record<string, string> = {
    new: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    contacted: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    completed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="mx-auto w-full max-w-5xl relative">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
            Orders
          </h1>
          <p className="tabular text-[13px] text-muted-foreground">
            {visible.length} of {orders.length}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, name..."
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-all focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {statuses.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatusFilter(s.value)}
                className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-all ${
                  active ? 'border-transparent bg-primary text-primary-foreground' : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground"></div>
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-16 text-center text-[13px] text-muted-foreground">No orders found.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {visible.map((order) => (
            <motion.li
              key={order.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedOrder(order)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-soft cursor-pointer hover:border-border/80 transition-colors gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[14px] font-semibold">{order.reference}</span>
                  <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="truncate text-[13px] font-medium text-foreground">{order.customer_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[12px] text-muted-foreground truncate">{order.customer_email}</p>
                  {order.customer_phone && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <p className="text-[12px] text-muted-foreground">{order.customer_phone}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1 shrink-0 text-muted-foreground">
                <span className="text-[13px] font-medium text-foreground">{order.total_items} items</span>
                <span className="text-[11px] uppercase tracking-[0.1em]">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Order Details Drawer Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 w-full max-w-md h-[90vh] sm:h-full bg-card sm:border-l border-border shadow-lift flex flex-col rounded-2xl sm:rounded-none overflow-hidden"
            >
              <header className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em]">Order Details</h2>
                  <p className="tabular font-mono text-[12px] text-muted-foreground">{selectedOrder.reference}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Customer</h3>
                  <div className="bg-surface rounded-xl p-4 border border-border">
                    <p className="font-medium text-[14px]">{selectedOrder.customer_name}</p>
                    <p className="text-[13px] text-muted-foreground mt-1">{selectedOrder.customer_email}</p>
                    {selectedOrder.customer_phone && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <p className="text-[13px] font-mono text-muted-foreground">{selectedOrder.customer_phone}</p>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => window.open(buildWhatsAppUrl(`Hi ${selectedOrder.customer_name}, regarding your order ${selectedOrder.reference}...`), '_blank')}
                        >
                          WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Order Status</h3>
                  </div>
                  <Select
                    value={selectedOrder.status}
                    options={[
                      { label: 'New', value: 'new' },
                      { label: 'Contacted', value: 'contacted' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Cancelled', value: 'cancelled' },
                    ]}
                    onChange={(val) => {
                      const newStatus = val as OrderStatus;
                      if (newStatus === 'cancelled') {
                        setPendingStatusChange({ id: selectedOrder.id, status: 'cancelled' });
                      } else {
                        // Directly update
                        (async () => {
                          try {
                            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', selectedOrder.id);
                            if (error) throw error;
                            setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o)));
                            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                            showToast('Order status updated');
                          } catch(e) {
                            showToast('Failed to update status');
                          }
                        })();
                      }
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Items ({selectedOrder.total_items})</h3>
                  <ul className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <li key={item.id} className="bg-surface rounded-xl p-3 border border-border flex justify-between items-center">
                         <div>
                           <p className="text-[13px] font-semibold">{item.product_name}</p>
                           <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{item.product_id}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[13px] font-medium">LKR {item.price.toFixed(2)}</p>
                           <p className="text-[12px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                         </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(pendingStatusChange)}
        title="Cancel Order?"
        description="Are you sure you want to cancel this order? This cannot be undone."
        confirmLabel="Cancel Order"
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatusChange(null)}
      />
    </div>
  );
}
