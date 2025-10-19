export interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: number;
  item_type: 'COFFEE' | 'DESSERT';
  image?: string;
  is_available: boolean;
  preparation_time: number;
}