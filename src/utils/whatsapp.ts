import type { Product, User } from '../types';

export const ADMIN_WHATSAPP_URL = 'https://wa.me/94729954571';

interface OrderLine {
  product: Product;
  quantity: number;
}

export function buildOrderMessage(
  reference: string,
  customer: Pick<User, 'fullName' | 'email'> & { phone?: string },
  lines: OrderLine[]
): string {
  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
  const productLines = lines
    .map(
      ({ product, quantity }) =>
        `• ${product.productId} — ${product.name} × ${quantity}`
    )
    .join('\n');

  const messageLines = [
    `*New FIGORA MODELS Order: ${reference}*`,
    '',
    `Customer: ${customer.fullName}`,
    `Email: ${customer.email}`,
  ];
  
  if (customer.phone) {
    messageLines.push(`Phone: ${customer.phone}`);
  }

  messageLines.push('', 'Products:', productLines, '', `Total Items: ${totalItems}`);

  return messageLines.join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  return `${ADMIN_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}