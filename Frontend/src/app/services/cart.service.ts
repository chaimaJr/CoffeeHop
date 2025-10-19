import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = signal<CartItem[]>([]);
  
  // Derived signals
  cart$ = this.cart.asReadonly();
  itemCount = computed(() => this.cart().length);
  total = computed(() => 
    this.cart().reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  );

  constructor() {}

  addToCart(menuItem: MenuItem, quantity: number, customizations: string = ''): void {
    const currentCart = this.cart();
    const existing = currentCart.find((item) => item.menuItem.id === menuItem.id);

    if (existing) {
      existing.quantity += quantity;
      existing.customizations = customizations;
      this.cart.set([...currentCart]);
    } else {
      this.cart.set([...currentCart, { menuItem, quantity, customizations }]);
    }
  }

  removeFromCart(menuItemId: number): void {
    this.cart.set(this.cart().filter((item) => item.menuItem.id !== menuItemId));
  }

  updateQuantity(menuItemId: number, quantity: number): void {
    const item = this.cart().find((i) => i.menuItem.id === menuItemId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      this.cart.set([...this.cart()]);
    }
  }

  getCart(): CartItem[] {
    return this.cart();
  }

  getCartTotal(): number {
    return this.total();
  }

  clearCart(): void {
    this.cart.set([]);
  }
}
