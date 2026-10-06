import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import type { Order } from '../types';

export function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setOrders(data as Order[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const statusColors: Record<string, string> = {
    new: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    contacted: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    completed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  if (!user) return null;

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-tight">My Account</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            {user.fullName} &bull; {user.email}
          </p>
        </div>
        <Button variant="secondary" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </header>

      <section>
        <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-muted-foreground mb-4">
          My Orders
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mb-2 text-[16px] font-medium">No orders yet</h3>
            <p className="mb-6 text-[14px] text-muted-foreground">
              When you place an order, it will appear here.
            </p>
            <Button onClick={() => navigate('/')}>Browse Catalogue</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div key={order.id} className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden transition-colors hover:border-border/80">
                  <button 
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 text-left focus:outline-none focus-visible:bg-surface/50"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-[14px] font-semibold">{order.reference}</span>
                        <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} &bull; {order.total_items} items
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-4 text-muted-foreground">
                      <span className="text-[13px] font-medium hidden sm:block">View Details</span>
                      <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-border pt-4">
                          {/* Status Timeline */}
                          <div className="mb-6">
                            <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground mb-2 uppercase tracking-[0.1em]">
                              Order Status
                            </div>
                            <div className="flex items-center gap-2 max-w-sm">
                              {['new', 'contacted', 'completed'].map((step, idx) => {
                                const statuses = ['new', 'contacted', 'completed'];
                                const currentIndex = statuses.indexOf(order.status === 'cancelled' ? 'new' : order.status);
                                const isPassed = idx <= currentIndex && order.status !== 'cancelled';
                                const isCurrent = idx === currentIndex && order.status !== 'cancelled';
                                return (
                                  <div key={step} className="flex-1 flex flex-col gap-2">
                                    <div className={`h-1.5 w-full rounded-full ${isPassed ? 'bg-primary' : 'bg-surface border border-border'}`} />
                                    <span className={`text-[11px] capitalize ${isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {order.status === 'cancelled' && (
                              <p className="mt-2 text-[12px] text-red-500 font-medium">This order has been cancelled.</p>
                            )}
                          </div>

                          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Items</h4>
                          <ul className="space-y-3">
                            {order.items?.map((item) => (
                              <li key={item.id} className="flex items-center justify-between bg-surface rounded-xl p-3 border border-border">
                                <div>
                                  <p className="text-[13px] font-semibold">{item.product_name}</p>
                                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.product_id}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[13px] font-medium">LKR {item.price.toFixed(2)}</p>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
