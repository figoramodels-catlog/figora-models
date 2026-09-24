import React from 'react';
import { useProducts } from '../../contexts/ProductsContext';

export function AdminDashboard() {
  const { items } = useProducts();
  const available = items.filter((item) => item.available).length;

  const cards = [
  { label: 'Total Products', value: items.length },
  { label: 'Available', value: available },
  { label: 'Out of Stock', value: items.length - available }];


  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[24px]">
        Dashboard
      </h1>
      <p className="text-[13px] text-muted-foreground">Catalogue overview</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {cards.map((card) =>
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          
            <p className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
              {card.label}
            </p>
            <p className="tabular mt-3 font-display text-[32px] font-semibold leading-none tracking-[-0.03em]">
              {card.value}
            </p>
          </div>
        )}
      </div>
    </div>);

}