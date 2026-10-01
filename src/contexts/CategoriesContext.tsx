import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Category } from '../types';

interface CategoriesContextValue {
  items: Category[];
  getById: (id: string) => Category | undefined;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: Category[]) => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const STORAGE_KEY = 'figora.categories.v2';

const seedCategories: Category[] = [];

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Category[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as Category[] : null;
      return parsed !== null ? parsed : seedCategories;
    } catch {
      return seedCategories;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    setItems((current) => [{ ...category, id: `c-${Date.now()}` }, ...current]);
  }, []);

  const updateCategory = useCallback((category: Category) => {
    setItems((current) =>
      current.map((item) => (item.id === category.id ? category : item))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const reorderCategories = useCallback((newOrder: Category[]) => {
    setItems(newOrder);
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        items,
        getById,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
}
