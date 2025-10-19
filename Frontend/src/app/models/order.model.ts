import { MenuItem } from "./menu-item.model";

export interface OrderItem {
  id: number;
  menu_item: MenuItem;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer: number;
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_price: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CreateOrderPayload {
  items: { menu_item_id: number; quantity: number }[];
  notes?: string;
}