import { MenuItem } from "./menu-item.model";

export interface OrderItem {
  menu_item: number;          
  menu_item_detail: MenuItem;
  quantity: number;
  customizations: string;
  price: number;
}

export interface Order {
  id: number;
  customer: number;
  items: OrderItem[];
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_price: number;
  notes: string;
  scheduled_for?: string;
  is_favourite: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateOrderPayload {
  items: Array<{ menu_item: number; quantity: number; customizations: string; price: number }>;
  total_price: number;
  notes: string;
}