import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { useCategories } from '../../contexts/CategoriesContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>, id?: string) => void;
}

const emptyDraft: Omit<Product, 'id'> = {
  productId: '',
  name: '',
  category: '',
  description: '',
  image: '',
  images: [],
  price: 0,
  available: true
};

export function ProductFormModal({
  open,
  product,
  onClose,
  onSave
}: ProductFormModalProps) {
  const { items: categoryItems } = useCategories();
  const [draft, setDraft] = useState<Omit<Product, 'id'>>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (product) {
      setDraft({ ...product, images: product.images || (product.image ? [product.image] : []) });
    } else {
      setDraft({ ...emptyDraft, category: categoryItems.length > 0 ? categoryItems[0].name : '' });
    }
  }, [open, product, categoryItems]);

  const onPickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    
    Promise.all(files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    }))).then(results => {
      setDraft(current => {
        const newImages = [...(current.images || []), ...results];
        return {
          ...current,
          image: newImages[0] || '',
          images: newImages
        };
      });
    });
    
    // Clear input so same files can be picked again
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setDraft(current => {
      const newImages = [...(current.images || [])];
      newImages.splice(idx, 1);
      return {
        ...current,
        image: newImages[0] || '',
        images: newImages
      };
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Product name is required.';
    if (!draft.productId.trim()) next.productId = 'Product ID is required.';
    if (!draft.images || draft.images.length === 0) next.image = 'Add at least one product image.';
    if (draft.price <= 0) next.price = 'Price must be greater than zero.';
    setErrors(next);
    if (Object.keys(next).length) return;
    
    setIsLoading(true);
    try {
      const finalImages = await Promise.all(
        (draft.images || []).map(async (img) => {
          if (img.startsWith('data:')) {
            const res = await fetch(img);
            const blob = await res.blob();
            const ext = blob.type.split('/')[1] || 'png';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const { data, error } = await supabase.storage.from('product-images').upload(fileName, blob, {
              contentType: blob.type
            });
            if (error) throw error;
            return data.path;
          }
          return img;
        })
      );

      await onSave(
        {
          ...draft,
          name: draft.name.trim(),
          productId: draft.productId.trim(),
          description: draft.description.trim(),
          image: finalImages[0] || '',
          images: finalImages
        },
        product?.id
      );
    } catch (e: any) {
      console.error(e);
      setErrors({ image: e.message || 'Failed to upload images' });
    }
    setIsLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Edit product' : 'Add product'}
      className="sm:max-w-xl">
      
      <form onSubmit={submit} className="space-y-4 p-5 sm:p-6" noValidate>
        <div>
          <label className="block text-[13px] font-medium text-muted-foreground mb-2">Product images</label>
          <div className="flex flex-wrap gap-3">
            {(draft.images || []).map((img, idx) => (
              <div key={idx} className="relative h-[100px] w-[80px] shrink-0 overflow-hidden rounded-xl border border-border bg-image">
                <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-[100px] w-[80px] shrink-0 rounded-xl border border-dashed border-border bg-surface grid place-items-center hover:bg-accent transition-colors"
            >
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={onPickImage}
            className="hidden"
          />
          {errors.image && <p className="mt-1.5 text-[12px] text-destructive">{errors.image}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Product name"
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            error={errors.name}
            placeholder="Shadow Samurai — 1/6 Scale"
          />
          <TextField
            type="number"
            min="0"
            step="0.01"
            label="Price (LKR)"
            value={draft.price || ''}
            onChange={(event) =>
              setDraft((current) => ({ ...current, price: parseFloat(event.target.value) || 0 }))
            }
            error={errors.price}
            placeholder="299.99"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Product ID"
            value={draft.productId}
            onChange={(event) =>
            setDraft((current) => ({
              ...current,
              productId: event.target.value
            }))
            }
            error={errors.productId}
            placeholder="FM-1041" />
          
          <div className="space-y-1.5">
            <label
              htmlFor="product-category"
              className="block text-[13px] font-medium text-muted-foreground">
              
              Category
            </label>
            <Select
              id="product-category"
              value={draft.category}
              onChange={(val) =>
                setDraft((current) => ({
                  ...current,
                  category: val
                }))
              }
              options={categoryItems.map(c => ({ label: c.name, value: c.name }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="product-description"
            className="block text-[13px] font-medium text-muted-foreground">
            
            Short description
          </label>
          <textarea
            id="product-description"
            rows={3}
            value={draft.description}
            onChange={(event) =>
            setDraft((current) => ({
              ...current,
              description: event.target.value
            }))
            }
            placeholder="Materials, scale, included parts…"
            className="w-full resize-none rounded-xl border border-border bg-surface p-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-all duration-200 ease-ios focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40" />
          
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
          <div>
            <p className="text-[14px] font-medium">Available</p>
            <p className="text-[12px] text-muted-foreground">
              Shown as in stock to customers
            </p>
          </div>
          <Switch
            checked={draft.available}
            onChange={(checked) =>
            setDraft((current) => ({ ...current, available: checked }))
            }
            label="Product availability" />
          
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}>
            
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Saving...' : product ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </form>
    </Modal>);

}