export interface OrderSummary {
  id: number;
  customer_name: string;
  status: string; 
  total_price: string;
  items_count: number;
  scheduled_for: string | null;
  created_at: string;
}