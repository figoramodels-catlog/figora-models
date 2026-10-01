import React, { useEffect, useState } from 'react';
import type { Category } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>, id?: string) => void;
}

const emptyDraft: Omit<Category, 'id'> = {
  name: ''
};

export function CategoryFormModal({
  open,
  category,
  onClose,
  onSave
}: CategoryFormModalProps) {
  const [draft, setDraft] = useState<Omit<Category, 'id'>>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(category ? { ...category } : emptyDraft);
  }, [open, category]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Category name is required.';
    
    setErrors(next);
    if (Object.keys(next).length) return;
    
    onSave(
      {
        ...draft,
        name: draft.name.trim()
      },
      category?.id
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'Add category'}
      className="sm:max-w-md">
      
      <form onSubmit={submit} className="space-y-4 p-5 sm:p-6" noValidate>
        <TextField
          label="Category name"
          value={draft.name}
          onChange={(event) =>
            setDraft((current) => ({ ...current, name: event.target.value }))
          }
          error={errors.name}
          placeholder="e.g. Diorama" />
        
        <div className="flex gap-2 pt-4">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1">
            {category ? 'Save changes' : 'Add category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
