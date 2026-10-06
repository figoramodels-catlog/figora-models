import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, X } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { useCategories } from '../contexts/CategoriesContext';
import { useCart } from '../contexts/CartContext';
import { useAddToCart } from '../hooks/useAddToCart';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import type { Product, StatusFilter } from '../types';
import { cn } from '../utils/cn';

const filters: Array<{value: StatusFilter;label: string;}> = [
{ value: 'all', label: 'All' },
{ value: 'available', label: 'Available' },
{ value: 'out-of-stock', label: 'Out of Stock' }];


export function Catalogue() {
  const { items, isLoading: productsLoading } = useProducts();
  const { items: categories, isLoading: categoriesLoading } = useCategories();
  const { totalQuantity, openCart } = useCart();
  const addToCart = useAddToCart();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selected, setSelected] = useState<Product | null>(null);

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

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-16 sm:pt-8">
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
            Collection
          </h1>
          <p className="tabular text-[13px] text-muted-foreground">
            {visible.length} model{visible.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true" />
          
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by Product ID"
            aria-label="Search by Product ID"
            className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-10 text-[14px] text-foreground placeholder:text-muted-foreground/80 transition-all duration-200 ease-ios focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40" />
          
          {query &&
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          }
        </div>
      </div>

      <div className="mt-8 mb-2">
        <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Categories
        </h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "group relative flex h-[104px] min-w-[140px] shrink-0 flex-col items-start justify-end overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out active:scale-[0.97]",
              selectedCategory === 'all'
                ? "bg-foreground text-background shadow-lg"
                : "border border-border bg-surface text-foreground hover:bg-accent"
            )}
          >
            <span className="relative z-10 text-[15px] font-semibold tracking-tight">All Models</span>
            <span className={cn(
              "relative z-10 mt-1 text-[12px]",
              selectedCategory === 'all' ? "text-background/80" : "text-muted-foreground"
            )}>
              Entire collection
            </span>
            {selectedCategory === 'all' && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-foreground"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              className={cn(
                "group relative flex h-[104px] min-w-[140px] shrink-0 flex-col items-start justify-end overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ease-out active:scale-[0.97]",
                selectedCategory === category.name
                  ? "bg-foreground text-background shadow-lg"
                  : "border border-border bg-surface text-foreground hover:bg-accent"
              )}
            >
              <span className="relative z-10 text-[15px] font-semibold tracking-tight">{category.name}</span>
              <span className={cn(
                "relative z-10 mt-1 text-[12px]",
                selectedCategory === category.name ? "text-background/80" : "text-muted-foreground"
              )}>
                Explore category
              </span>
              {selectedCategory === category.name && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-foreground"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter by availability"
        className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        
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
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active ?
                'border-transparent bg-primary text-primary-foreground' :
                'border-border bg-surface text-muted-foreground hover:text-foreground'
              )}>
              
              {filter.label}
            </button>);

        })}
      </div>

      {productsLoading || categoriesLoading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-foreground"></div>
        </div>
      ) : visible.length === 0 ?
      <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-[15px] font-medium">No models found</p>
          <p className="max-w-xs text-[13px] text-muted-foreground">
            Try a different Product ID or clear the availability filter.
          </p>
        </div> :

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((product) =>
        <ProductCard
          key={product.id}
          product={product}
          onOpen={setSelected}
          onAdd={(item) => addToCart(item.id)} />

        )}
        </div>
      }

      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={(item) => {
          const added = addToCart(item.id);
          if (added) setSelected(null);
        }} />
      

      <button
        type="button"
        onClick={openCart}
        aria-label={`Open cart, ${totalQuantity} item${
        totalQuantity === 1 ? '' : 's'}`
        }
        className="glass fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full border border-border px-5 shadow-lift transition-all duration-200 ease-ios active:scale-95 sm:hidden">
        
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        <span className="tabular text-[14px] font-semibold">
          {totalQuantity}
        </span>
      </button>
    </motion.main>);

}