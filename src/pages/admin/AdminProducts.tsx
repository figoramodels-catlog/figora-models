import { useMemo, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useProducts } from '../../contexts/ProductsContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import type { Product, StatusFilter } from '../../types';
import { cn } from '../../utils/cn';

const filters: Array<{value: StatusFilter;label: string;}> = [
{ value: 'all', label: 'All' },
{ value: 'available', label: 'Available' },
{ value: 'out-of-stock', label: 'Out of Stock' }];


export function AdminProducts() {
  const {
    items,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
    reorderProducts
  } = useProducts();
  const { items: categories } = useCategories();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((product) => {
      const matchesStatus =
      status === 'all' || (
      status === 'available' ? product.available : !product.available);
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const matchesQuery =
      !needle ||
      product.productId.toLowerCase().includes(needle) ||
      product.name.toLowerCase().includes(needle);
      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [items, query, status, selectedCategory]);

  const onSave = (draft: Omit<Product, 'id'>, id?: string) => {
    if (id) {
      updateProduct({ ...draft, id });
      showToast('Product updated');
    } else {
      addProduct(draft);
      showToast('Product added');
    }
    setFormOpen(false);
    setEditing(null);
  };

  const isFiltering = query.trim() !== '' || status !== 'all' || selectedCategory !== 'all';

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
            Products
          </h1>
          <p className="tabular text-[13px] text-muted-foreground">
            {visible.length} of {items.length}
          </p>
        </div>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}>
          
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true" />
          
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by Product ID or Name"
            aria-label="Search products"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-all duration-200 ease-ios focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40" />
          
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { label: 'All Categories', value: 'all' },
              ...categories.map(c => ({ label: c.name, value: c.name }))
            ]}
          />
        </div>

        <div
          role="group"
          aria-label="Filter by availability"
          className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          
          {filters.map((filter) => {
            const active = status === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(filter.value)}
                className={cn(
                  'h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-all duration-200 ease-ios active:scale-[0.97]',
                  active ?
                  'border-transparent bg-primary text-primary-foreground' :
                  'border-border bg-surface text-muted-foreground hover:text-foreground'
                )}>
                
                {filter.label}
              </button>);

          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-[13px] text-muted-foreground">
          No products match this search.
        </p>
      ) : isFiltering ? (
        <ul className="mt-5 space-y-2">
          {visible.map((product) => (
            <motion.li
              key={product.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4"
            >
              <div className="h-[64px] w-[52px] shrink-0 overflow-hidden rounded-xl bg-image">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-mono text-[12px] font-medium text-foreground">
                    LKR {(product.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {product.productId}
                  </p>
                </div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {product.category}
                </p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-[12px] text-muted-foreground">
                  {product.available ? 'Available' : 'Out of stock'}
                </span>
                <Switch
                  checked={product.available}
                  onChange={() => toggleAvailability(product.id)}
                  label={`Availability for ${product.name}`}
                />
              </div>
              <div className="flex items-center gap-1">
                <div className="sm:hidden">
                  <Switch
                    checked={product.available}
                    onChange={() => toggleAvailability(product.id)}
                    label={`Availability for ${product.name}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(product);
                    setFormOpen(true);
                  }}
                  aria-label={`Edit ${product.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(product)}
                  aria-label={`Delete ${product.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:border-destructive/40 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={reorderProducts} className="mt-5 space-y-2">
          {items.map((product) => (
            <Reorder.Item
              key={product.id}
              value={product}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4 bg-card"
            >
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition-colors p-1 -ml-2 rounded-md hover:bg-accent shrink-0">
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="h-[64px] w-[52px] shrink-0 overflow-hidden rounded-xl bg-image">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-mono text-[12px] font-medium text-foreground">
                    LKR {(product.price || 0).toFixed(2)}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {product.productId}
                  </p>
                </div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {product.category}
                </p>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-[12px] text-muted-foreground">
                  {product.available ? 'Available' : 'Out of stock'}
                </span>
                <Switch
                  checked={product.available}
                  onChange={() => toggleAvailability(product.id)}
                  label={`Availability for ${product.name}`}
                />
              </div>
              <div className="flex items-center gap-1">
                <div className="sm:hidden">
                  <Switch
                    checked={product.available}
                    onChange={() => toggleAvailability(product.id)}
                    label={`Availability for ${product.name}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(product);
                    setFormOpen(true);
                  }}
                  aria-label={`Edit ${product.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(product)}
                  aria-label={`Delete ${product.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:border-destructive/40 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <ProductFormModal
        open={formOpen}
        product={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={onSave} />
      

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete product?"
        description={`${pendingDelete?.name ?? ''} will be removed from the customer catalogue.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) {
            deleteProduct(pendingDelete.id);
            showToast('Product deleted');
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)} />
      
    </div>);

}