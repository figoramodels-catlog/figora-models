import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import type { Product } from '../../types';
import { categories } from '../../data/products';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Switch } from '../ui/Switch';

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>, id?: string) => void;
}

const emptyDraft: Omit<Product, 'id'> = {
  productId: '',
  name: '',
  category: categories[0],
  description: '',
  image: '',
  available: true
};

export function ProductFormModal({
  open,
  product,
  onClose,
  onSave
}: ProductFormModalProps) {
  const [draft, setDraft] = useState<Omit<Product, 'id'>>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(product ? { ...product } : emptyDraft);
  }, [open, product]);

  const onPickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
    setDraft((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Product name is required.';
    if (!draft.productId.trim()) next.productId = 'Product ID is required.';
    if (!draft.image) next.image = 'Add a product image.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave(
      {
        ...draft,
        name: draft.name.trim(),
        productId: draft.productId.trim(),
        description: draft.description.trim()
      },
      product?.id
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Edit product' : 'Add product'}
      className="sm:max-w-xl">
      
      <form onSubmit={submit} className="space-y-4 p-5 sm:p-6" noValidate>
        <div className="flex gap-4">
          <div className="h-[130px] w-[104px] shrink-0 overflow-hidden rounded-2xl border border-border bg-image">
            {draft.image ?
            <img
              src={draft.image}
              alt="Product preview"
              className="h-full w-full object-cover" /> :


            <div className="grid h-full w-full place-items-center">
                <ImagePlus
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true" />
              
              </div>
            }
          </div>
          <div className="flex flex-col justify-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickImage}
              className="hidden" />
            
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}>
              
              Upload image
            </Button>
            {draft.image &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
              setDraft((current) => ({ ...current, image: '' }))
              }>
              
                Remove
              </Button>
            }
            {errors.image &&
            <p className="text-[12px] text-destructive">{errors.image}</p>
            }
          </div>
        </div>

        <TextField
          label="Product name"
          value={draft.name}
          onChange={(event) =>
          setDraft((current) => ({ ...current, name: event.target.value }))
          }
          error={errors.name}
          placeholder="Shadow Samurai — 1/6 Scale" />
        

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
            <select
              id="product-category"
              value={draft.category}
              onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: event.target.value
              }))
              }
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[15px] text-foreground transition-all duration-200 ease-ios focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/40">
              
              {categories.map((category) =>
              <option key={category} value={category}>
                  {category}
                </option>
              )}
            </select>
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
          <Button type="submit" size="lg" className="flex-1">
            {product ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </form>
    </Modal>);

}