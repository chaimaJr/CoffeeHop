export interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: number;
  image?: string;
  item_type: 'COFFEE' | 'DESSERT';
  is_available: boolean;
}