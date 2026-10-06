import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Tags, Users, ArrowRight, ShoppingBag } from 'lucide-react';
import { useProducts } from '../../contexts/ProductsContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const { items } = useProducts();
  const navigate = useNavigate();
  
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [newOrders, setNewOrders] = useState<number | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [suspendedCustomers, setSuspendedCustomers] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalOrders(count || 0));
      
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new')
      .then(({ count }) => setNewOrders(count || 0));

    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalCustomers(count || 0));

    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', false)
      .then(({ count }) => setSuspendedCustomers(count || 0));

    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => {
        if (data) setRecentOrders(data);
      });
  }, []);

  const available = items.filter((item) => item.available).length;
  const outOfStock = items.length - available;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 pb-8">
      <header>
        <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
          Dashboard
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">Store overview</p>
      </header>

      {/* Summary Cards */}
      <section>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">Total Orders</p>
            <p className="tabular mt-3 font-display text-[32px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {totalOrders === null ? '...' : totalOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">New Orders</p>
            <p className="tabular mt-3 font-display text-[32px] font-semibold leading-none tracking-[-0.03em] text-primary">
              {newOrders === null ? '...' : newOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">Total Customers</p>
            <p className="tabular mt-3 font-display text-[32px] font-semibold leading-none tracking-[-0.03em] text-foreground">
              {totalCustomers === null ? '...' : totalCustomers}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Button
            variant="secondary"
            className="flex h-auto flex-col gap-3 py-5 rounded-2xl"
            onClick={() => navigate('/admin/products')}
          >
            <Boxes className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-[13px] font-semibold">Add Product</span>
          </Button>
          <Button
            variant="secondary"
            className="flex h-auto flex-col gap-3 py-5 rounded-2xl"
            onClick={() => navigate('/admin/categories')}
          >
            <Tags className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-[13px] font-semibold">Add Category</span>
          </Button>
          <Button
            variant="secondary"
            className="flex h-auto flex-col gap-3 py-5 rounded-2xl"
            onClick={() => navigate('/admin/orders')}
          >
            <ShoppingBag className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-[13px] font-semibold">View Orders</span>
          </Button>
          <Button
            variant="secondary"
            className="flex h-auto flex-col gap-3 py-5 rounded-2xl"
            onClick={() => navigate('/admin/customers')}
          >
            <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-[13px] font-semibold">View Customers</span>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Catalogue Health
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground">Available Products</span>
            <span className="font-mono text-[14px] text-muted-foreground">{available}</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground">Out of Stock</span>
            <span className="font-mono text-[14px] text-destructive">{outOfStock}</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground">Suspended Customers</span>
            <span className="font-mono text-[14px] text-muted-foreground">{suspendedCustomers === null ? '...' : suspendedCustomers}</span>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Recent Orders
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/orders')}
            className="-mr-2 text-muted-foreground"
          >
            View all <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-surface/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-foreground">
                      {o.reference} &bull; <span className="font-normal">{o.customer_name}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted-foreground">
                      {o.status}
                    </span>
                    <span className="text-[12px] text-foreground font-medium">{o.total_items} items</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}