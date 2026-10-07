import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import type { Product } from '../types';
import { supabase } from '../lib/supabase';

interface ProductsContextValue {
  items: Product[];
  isLoading: boolean;
  getById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  reorderProducts: (newOrder: Product[]) => Promise<void>;
  updateCategoryName: (oldName: string, newName: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapToProduct = (data: any): Product => {
    // Generate public URLs for images if they are just paths
    const generateUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    };

    const imagesArray = Array.isArray(data.images) ? data.images.map(generateUrl) : [];
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : '';

    return {
      id: data.id,
      productId: data.product_id,
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      available: data.available,
      image: mainImage,
      images: imagesArray,
    };
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setItems(data.map(mapToProduct));
    } else {
      console.error('Error fetching products:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    // Extract paths from full URLs if they were uploaded to supabase storage
    const bucketUrl = supabase.storage.from('product-images').getPublicUrl('').data.publicUrl;
    const cleanPaths = (product.images || [product.image]).map(img => {
      if (img.startsWith(bucketUrl)) {
        return img.replace(bucketUrl + '/', '');
      }
      return img;
    });

    const { data, error } = await supabase
      .from('products')
      .insert({
        product_id: product.productId,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        available: product.available,
        images: cleanPaths,
        sort_order: items.length
      })
      .select()
      .single();

    if (!error && data) {
      setItems((current) => [mapToProduct(data), ...current]);
    } else {
      console.error('Error adding product:', error);
    }
  }, [items]);

  const updateProduct = useCallback(async (product: Product) => {
    const bucketUrl = supabase.storage.from('product-images').getPublicUrl('').data.publicUrl;
    const cleanPaths = (product.images || [product.image]).map(img => {
      if (img.startsWith(bucketUrl)) {
        return img.replace(bucketUrl + '/', '');
      }
      return img;
    });

    const { error } = await supabase
      .from('products')
      .update({
        product_id: product.productId,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        available: product.available,
        images: cleanPaths,
      })
      .eq('id', product.id);

    if (!error) {
      setItems((current) =>
        current.map((item) => (item.id === product.id ? product : item))
      );
    } else {
      console.error('Error updating product:', error);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems((current) => current.filter((item) => item.id !== id));
    } else {
      console.error('Error deleting product:', error);
    }
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const { error } = await supabase
      .from('products')
      .update({ available: !item.available })
      .eq('id', id);

    if (!error) {
      setItems((current) =>
        current.map((i) =>
          i.id === id ? { ...i, available: !i.available } : i
        )
      );
    } else {
      console.error('Error toggling availability:', error);
    }
  }, [items]);

  const reorderProducts = useCallback(async (newOrder: Product[]) => {
    setItems(newOrder);

    // Actually, upserting everything is simpler if we have all fields.
    const fullUpdates = newOrder.map((product, index) => {
      const bucketUrl = supabase.storage.from('product-images').getPublicUrl('').data.publicUrl;
      const cleanPaths = (product.images || [product.image]).map(img => {
        if (img.startsWith(bucketUrl)) {
          return img.replace(bucketUrl + '/', '');
        }
        return img;
      });
      return {
        id: product.id,
        product_id: product.productId,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        available: product.available,
        images: cleanPaths,
        sort_order: index
      };
    });

    const { error } = await supabase.from('products').upsert(fullUpdates);

    if (error) {
      console.error('Error reordering products:', error);
      fetchProducts();
    }
  }, [fetchProducts]);

  const updateCategoryName = useCallback(async (oldName: string, newName: string) => {
    const { error } = await supabase
      .from('products')
      .update({ category: newName })
      .eq('category', oldName);

    if (!error) {
      setItems((current) =>
        current.map((item) =>
          item.category === oldName ? { ...item, category: newName } : item
        )
      );
    } else {
      console.error('Error updating category name in products:', error);
    }
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        items,
        isLoading,
        getById,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability,
        reorderProducts,
        updateCategoryName
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error('useProducts must be used within ProductsProvider');
  return context;
}