import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  // In-memory "cart" while building order
  cartItems: { menu_item_id: number; quantity: number }[] = []

  /*
  addToCart(itemId, quantity)
  removeFromCart(itemId)
  getCartTotal() → Calculate price
  submitOrder() → POST cart items to backend
  getMyOrders() → Fetch user's orders
  getOrderDetail(orderId) → Single order + listen for updates
  modifyOrder(orderId, newItems)
  cancelOrder(orderId)
  */
 
}
