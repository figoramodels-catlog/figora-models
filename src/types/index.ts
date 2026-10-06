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
  password?: string;
  role: Role;
  is_active?: boolean;
  created_at?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = 'new' | 'contacted' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_items: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  created_at: string;
}