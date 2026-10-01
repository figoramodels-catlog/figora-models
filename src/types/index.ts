export interface Product {
  /** Internal record key */
  id: string;
  /** Customer-facing product code, e.g. FM-1042 */
  productId: string;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export type StatusFilter = 'all' | 'available' | 'out-of-stock';

export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export interface CartItem {
  productId: string;
  quantity: number;
}