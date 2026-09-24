import type { Product, User } from '../types';

export const ADMIN_WHATSAPP_URL = 'https://wa.me/94729954571';

interface OrderLine {
  product: Product;
  quantity: number;
}

export function buildOrderMessage(
customer: Pick<User, 'fullName' | 'email'>,
lines: OrderLine[])
: string {
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
  const productLines = lines.
  map(
    ({ product, quantity }) =>
    `• ${product.productId} — ${product.name} × ${quantity}`
  ).
  join('\n');

  return [
  'New FIGORA MODELS Order',
  '',
  `Customer: ${customer.fullName}`,
  `Email: ${customer.email}`,
  '',
  'Products:',
  productLines,
  '',
  `Total Items: ${totalItems}`].
  join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  return `${ADMIN_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}