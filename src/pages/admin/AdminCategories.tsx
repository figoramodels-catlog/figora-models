import { useMemo, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCategories } from '../../contexts/CategoriesContext';
import { useProducts } from '../../contexts/ProductsContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal';
import type { Category } from '../../types';

export function AdminCategories() {
  const {
    items,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  } = useCategories();
  const { updateCategoryName } = useProducts();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((category) => {
      return !needle || category.name.toLowerCase().includes(needle);
    });
  }, [items, query]);

  const onSave = async (draft: Omit<Category, 'id'>, id?: string) => {
    if (id) {
      const oldCategory = items.find((c) => c.id === id);
      if (oldCategory && oldCategory.name !== draft.name) {
        updateCategoryName(oldCategory.name, draft.name);
      }
      await updateCategory({ ...draft, id });
      showToast('Category updated');
    } else {
      await addCategory(draft);
      showToast('Category added');
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
            Categories
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
          Add Category
        </Button>
      </div>

      <div className="mt-5">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true" />
          
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories"
            aria-label="Search categories"
            className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-all duration-200 ease-ios focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40" />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-[13px] text-muted-foreground">
          No categories match this search.
        </p>
      ) : query ? (
        <ul className="mt-5 space-y-2">
          {visible.map((category) => (
            <motion.li
              key={category.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                  {category.name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(category);
                    setFormOpen(true);
                  }}
                  aria-label={`Edit ${category.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:border-destructive/40 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={reorderCategories} className="mt-5 space-y-2">
          {items.map((category) => (
            <Reorder.Item
              key={category.id}
              value={category}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4 bg-card"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition-colors p-1 -ml-2 rounded-md hover:bg-accent">
                  <GripVertical className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                  {category.name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(category);
                    setFormOpen(true);
                  }}
                  aria-label={`Edit ${category.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-200 ease-ios hover:border-destructive/40 hover:text-destructive active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <CategoryFormModal
        open={formOpen}
        category={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={onSave} />
      
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete category?"
        description={`${pendingDelete?.name ?? ''} will be removed. Products in this category might need to be reassigned.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteCategory(pendingDelete.id);
            showToast('Category deleted');
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)} />
      
    </div>);
}
