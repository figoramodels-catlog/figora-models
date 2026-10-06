import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Category } from '../types';
import { supabase } from '../lib/supabase';

interface CategoriesContextValue {
  items: Category[];
  isLoading: boolean;
  getById: (id: string) => Category | undefined;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (newOrder: Category[]) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error && data) {
      // Map the data if necessary, assuming columns are id, name, sort_order
      setItems(data.map(d => ({
        id: d.id,
        name: d.name
      })));
    } else if (error) {
      console.error('Error fetching categories:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        sort_order: items.length
      })
      .select()
      .single();

    if (!error && data) {
      setItems((current) => [...current, { id: data.id, name: data.name }]);
    } else {
      console.error('Error adding category:', error);
    }
  }, [items]);

  const updateCategory = useCallback(async (category: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ name: category.name })
      .eq('id', category.id);
      
    if (!error) {
      setItems((current) =>
        current.map((item) => (item.id === category.id ? category : item))
      );
    } else {
      console.error('Error updating category:', error);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setItems((current) => current.filter((item) => item.id !== id));
    } else {
      console.error('Error deleting category:', error);
    }
  }, []);

  const reorderCategories = useCallback(async (newOrder: Category[]) => {
    setItems(newOrder); // Optimistic update
    
    const updates = newOrder.map((category, index) => ({
      id: category.id,
      name: category.name,
      sort_order: index
    }));
    
    const { error } = await supabase
      .from('categories')
      .upsert(updates);
      
    if (error) {
      console.error('Error reordering categories:', error);
      // fallback
      fetchCategories();
    }
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        items,
        isLoading,
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
