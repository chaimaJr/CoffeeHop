import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonListHeader,
  IonToast,
} from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api.service';
import { Order, OrderItem } from 'src/app/models/order.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { logOut, logOutOutline } from 'ionicons/icons' 
import { addIcons } from 'ionicons';


addIcons({ logOut });


@Component({
  selector: 'app-barista-home',
  templateUrl: './barista-home.page.html',
  styleUrls: ['./barista-home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonButton,
    IonIcon,
    IonSpinner,
    IonModal,
    IonButtons,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonList,
    IonListHeader,
    IonToast,
  ],
})
export class BaristaHomePage implements OnInit {
  // Array to store the list of orders in the queue
  orders: Order[] = [];

  loading: boolean = false;

  // Controls visibility of order details modal
  showOrderModal = false;

  // Stores the currently selected order for viewing/editing
  selectedOrder: Order | null = null;

  // The new status to be applied to the selected order
  newStatus: string = '';

  // Controls visibility of toast notifications
  showToast = false;

  toastMessage = '';

  // Color of the toast (success, warning, danger, etc.)
  toastColor = 'success';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
      addIcons({logOutOutline});}

  // Called when component initializes
  ngOnInit() {
    // Load orders when page loads
    this.loadOrders();
  }

  /**
   * Loads the order queue from the API
   */
  loadOrders() {
    // Set loading state to true to show spinner
    this.loading = true;

    // Call API service to get order queue
    this.apiService.getOrderQueue().subscribe({
      // On successful response
      next: (data) => {
        // Update orders array with received data
        this.orders = data;
        // Hide loading spinner
        this.loading = false;
      },
      // On error
      error: (err) => {
        console.error('Error loading orders:', err);
        // Hide loading spinner even on error
        this.loading = false;
        // Show error toast
        this.displayToast('Failed to load orders', 'danger');
      },
    });
  }

  /**
   * Handles pull-to-refresh gesture
   * @param event - The refresh event from ion-refresher
   */
  handleRefresh(event: any) {
    // Call API to reload orders
    this.apiService.getOrderQueue().subscribe({
      next: (data) => {
        // Update orders list
        this.orders = data;
        // Complete the refresh animation
        event.target.complete();
        // Show success message
        this.displayToast('Orders refreshed', 'success');
      },
      error: (err) => {
        console.error('Error refreshing orders:', err);
        // Complete the refresh animation even on error
        event.target.complete();
        // Show error message
        this.displayToast('Failed to refresh orders', 'danger');
      },
    });
  }

  /**
   * Opens the order details modal when an order card is clicked
   * @param order - The order to display
   */
  openOrderDetails(order: Order) {
    // Store the selected order
    this.selectedOrder = order;
    // Initialize the status selector with current order status
    this.newStatus = order.status;
    // Show the modal
    this.showOrderModal = true;
  }

  /**
   * Updates the status of the currently selected order
   */
  updateStatus() {
    // Check if an order is selected
    if (!this.selectedOrder) return;

    // Check if status didnt change
    if (this.newStatus === this.selectedOrder.status) {
      this.showOrderModal = false;
      return;
    }

    this.apiService.updateOrderStatus(this.selectedOrder.id, this.newStatus).subscribe({
      next: (updatedOrder) => {
        
        // If the new status is 'COMPLETED', remove it from the queue list.
        if (updatedOrder.status === 'COMPLETED') {
          this.orders = this.orders.filter(o => o.id !== updatedOrder.id);
        } else {
          // Otherwise, update the order in the array
          const index = this.orders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
        }

        // Close the modal
        this.showOrderModal = false;
        this.displayToast(`Order #${updatedOrder.id} updated to ${updatedOrder.status}`, 'success');
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        this.displayToast('Failed to update order status', 'danger');
      }
    });
  }

  /**
   * Returns the appropriate color for a status badge
   * @param status - The order status
   * @returns The Ionic color name
   */
  getStatusColor(status: string): string {
    // Map status to color
    switch (status) {
      case 'RECEIVED':
        return 'primary'; // Blue - new order
      case 'PREPARING':
        return 'warning'; // Orange - in progress
      case 'READY':
        return 'success'; // Green - ready for pickup
      default:
        return 'medium'; // Default gray
    }
  }

  /**
   * Calculates the total number of items in an order
   * @param items - Array of order items
   * @returns Total quantity of all items
   */
  getTotalItems(items: OrderItem[]): number {
    // Check if items array exists and is not empty
    if (!items || items.length === 0) return 0;
    // Sum up all quantities using reduce
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Displays a toast notification
   * @param message - The message to display
   * @param color - The color of the toast
   */
  displayToast(message: string, color: string = 'success') {
    // Set toast properties
    this.toastMessage = message;
    this.toastColor = color;
    // Show the toast
    this.showToast = true;
  }

  logout() {
    this.authService.logout();
    // replaceUrl: prevent the user from navigating "back"
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
