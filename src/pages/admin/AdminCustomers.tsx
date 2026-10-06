import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { Button } from '../../components/ui/Button';
import type { User, Role } from '../../types';

interface ExtendedUser extends User {
  order_count?: number;
  phone?: string;
}

export function AdminCustomers() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  
  const [pendingRoleChange, setPendingRoleChange] = useState<{ id: string; role: Role } | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*, orders(count)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCustomers(
        data.map((p) => ({
          id: p.id,
          email: p.email || '',
          fullName: p.full_name || '',
          role: p.role as Role,
          is_active: p.is_active ?? true,
          created_at: p.created_at,
          phone: p.phone,
          order_count: p.orders ? p.orders[0]?.count : 0
        }))
      );
    } catch (e: any) {
      console.error(e);
      setError('Failed to load customers.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
      );
      showToast(currentStatus ? 'Account suspended' : 'Account activated');
    } catch (e: any) {
      console.error(e);
      showToast('Failed to update status');
    }
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: pendingRoleChange.role })
        .eq('id', pendingRoleChange.id);

      if (updateError) throw updateError;
      
      setCustomers((prev) =>
        prev.map((c) => (c.id === pendingRoleChange.id ? { ...c, role: pendingRoleChange.role } : c))
      );
      showToast('Role updated');
    } catch (e: any) {
      console.error(e);
      showToast('Failed to update role');
    } finally {
      setPendingRoleChange(null);
    }
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(needle) ||
        (c.email && c.email.toLowerCase().includes(needle)) ||
        c.id.toLowerCase().includes(needle)
    );
  }, [customers, query]);

  return (
    <div className="mx-auto w-full max-w-5xl relative">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
            Customers
          </h1>
          <p className="tabular text-[13px] text-muted-foreground">
            {visible.length} total
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search customers"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-all duration-200 ease-ios focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground"></div>
        </div>
      ) : error ? (
        <p className="mt-16 text-center text-[13px] text-destructive">
          {error}
        </p>
      ) : visible.length === 0 ? (
        <p className="mt-16 text-center text-[13px] text-muted-foreground">
          No customers found.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {visible.map((customer) => (
            <motion.li
              key={customer.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                  {customer.fullName || 'Unknown'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[12px] text-muted-foreground truncate">{customer.email}</p>
                  {customer.phone && (
                     <>
                       <span className="h-1 w-1 rounded-full bg-border" />
                       <p className="text-[12px] text-muted-foreground">{customer.phone}</p>
                     </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Joined {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground font-medium">
                    {customer.order_count} order{customer.order_count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                {customer.phone && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => window.open(buildWhatsAppUrl(`Hi ${customer.fullName}, `), '_blank')}
                    className="h-9"
                  >
                    WhatsApp
                  </Button>
                )}
                <div className="w-28">
                  <Select
                    value={customer.role}
                    disabled={customer.id === currentUser?.id}
                    onChange={(val) => {
                      if (val !== customer.role) {
                        setPendingRoleChange({ id: customer.id, role: val as Role });
                      }
                    }}
                    options={[
                      { label: 'Customer', value: 'customer' },
                      { label: 'Admin', value: 'admin' },
                    ]}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[11px] uppercase tracking-[0.1em] font-medium ${customer.is_active ? 'text-primary' : 'text-destructive'}`}>
                    {customer.is_active ? 'Active' : 'Suspended'}
                  </span>
                  {customer.id !== currentUser?.id && (
                    <Switch
                      checked={customer.is_active ?? true}
                      onChange={() => toggleStatus(customer.id, customer.is_active ?? true)}
                      label={`Status for ${customer.fullName}`}
                    />
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingRoleChange)}
        title="Change Role?"
        description={`Are you sure you want to change this user's role to ${pendingRoleChange?.role}?`}
        confirmLabel="Change Role"
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingRoleChange(null)}
      />
    </div>
  );
}
