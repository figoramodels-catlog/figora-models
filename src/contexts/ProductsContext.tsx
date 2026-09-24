import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState } from
'react';
import { products as seedProducts } from '../data/products';
import type { Product } from '../types';

interface ProductsContextValue {
  items: Product[];
  getById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

const STORAGE_KEY = 'figora.products';

export function ProductsProvider({ children }: {children: React.ReactNode;}) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as Product[] : null;
      return parsed && parsed.length ? parsed : seedProducts;
    } catch {
      return seedProducts;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {

      /* storage unavailable */}
  }, [items]);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    setItems((current) => [{ ...product, id: `p-${Date.now()}` }, ...current]);
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setItems((current) =>
    current.map((item) => item.id === product.id ? product : item)
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toggleAvailability = useCallback((id: string) => {
    setItems((current) =>
    current.map((item) =>
    item.id === id ? { ...item, available: !item.available } : item
    )
    );
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        items,
        getById,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability
      }}>
      
      {children}
    </ProductsContext.Provider>);

}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context)
  throw new Error('useProducts must be used within ProductsProvider');
  return context;
}