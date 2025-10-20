import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenuItem } from '../models/menu-item.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // ===== MENU =====
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu-items/`);
  }

  // ===== ORDERS - CUSTOMER =====
  createOrder(payload: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/`, payload);
  }

  /**
   * Get my orders - automatically filters to current user
   */
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}/`);
  }

  /**
   * Update order (only if status is RECEIVED)
   */
  updateOrder(id: number, data: any): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/`, data);
  }

  /**
   * Cancel order 
   */
  cancelOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/orders/${id}/`);
  }

  /**
   * Mark order as favourite
   */
  markFavourite(id: number, is_favourite: boolean): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${id}/mark_favourite/`, {
      is_favourite
    });
  }

  // ===== ORDERS - BARISTA =====
  /**
   * Get order queue 
   */
  getOrderQueue(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/queue/`);
  }

  /**
   * Update order status 
   */
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${id}/update_status/`, {
      status
    });
  }

  // ===== FAVOURITES =====
  /**
   * Get my favourite orders
   */
  getFavourites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/favourites/`);
  }

  /**
   * Save order as favourite
   */
  saveFavourite(name: string, template_order: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/favourites/`, {
      name,
      template_order
    });
  }

  /**
   * Reorder from favourite
   */
  reorderFromFavourite(id: number, scheduled_for?: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/favourites/${id}/reorder/`, {
      scheduled_for: scheduled_for || null
    });
  }

  /**
   * Delete favourite
   */
  deleteFavourite(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/favourites/${id}/`);
  }

  // ===== LOYALTY =====
  /**
   * Get loyalty points balance
   */
  getLoyaltyPoints(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/loyalty-points/`);
  }

  redeemLoyaltyOffer(offerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/loyalty-offers/${offerId}/redeem/`, {});
  }

  /**
   * Get available loyalty offers
   */
  getLoyaltyOffers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/loyalty-offers/`);
  }

  // ===== USER PROFILE =====
  /**
   * Update user profile
   */
  updateProfile(data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/profile/`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`);
  }

  // ===== NOTIFICATIONS =====
  /**
   * Get my notifications
   */
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications/`);
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/${id}/mark_read/`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/mark_all_read/`, {});
  }
}