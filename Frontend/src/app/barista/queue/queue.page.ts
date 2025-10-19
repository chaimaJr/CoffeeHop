import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonToast, IonButtons, IonFab, IonFabButton, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { refresh, logOut } from 'ionicons/icons';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { Order } from 'src/app/models/order.model';

addIcons({ refresh, logOut });

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonToast,
    IonButtons,
    IonFab,
    IonFabButton,
    IonIcon,
    IonBadge,
    IonSpinner,
  ],
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],
})
export class QueuePage implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  orders: Order[] = [];
  loading = true;
  updateMessage: string | null = null;
  refreshInterval: any;

  ngOnInit(): void {
    this.loadQueue();
    this.refreshInterval = setInterval(() => this.loadQueue(), 5000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadQueue(): void {
    // this.apiService.getAllOrders().subscribe({
    //   next: (orders) => {
    //     this.orders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     console.error('Failed to load queue', err);
    //     this.loading = false;
    //   },
    // });
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter((o) => o.status === status);
  }

  getCountByStatus(status: string): number {
    return this.getOrdersByStatus(status).length;
  }

  updateStatus(orderId: number, newStatus: string): void {
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.updateMessage = `Order #${orderId} → ${newStatus}`;
        this.loadQueue();
        setTimeout(() => (this.updateMessage = null), 2000);
      },
      error: (err) => console.error('Failed to update', err),
    });
  }

  refreshQueue(): void {
    this.loadQueue();
  }

  logout(): void {
    this.authService.logout();
  }
}