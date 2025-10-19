// ============================================================================
// src/app/pages/customer/home/home.page.ts (FIXED)
// ============================================================================
import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonListHeader, IonLabel, IonBadge, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { Order } from 'src/app/models/order.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonListHeader,
    IonLabel,
    IonBadge,
    IonButton,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  user = this.authService.currentUser;
  recentOrders: Order[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadRecentOrders();
  }

  loadRecentOrders(): void {
    this.apiService.getMyOrders().subscribe({
      next: (response: any) => {
        console.log('Orders response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          // If it's already an array
          this.recentOrders = response.slice(0, 5);
        } else if (response?.results && Array.isArray(response.results)) {
          // If it's paginated response (Django REST Framework default)
          this.recentOrders = response.results.slice(0, 5);
        } else if (response?.data && Array.isArray(response.data)) {
          // If it's wrapped in 'data' property
          this.recentOrders = response.data.slice(0, 5);
        } else {
          console.warn('Unexpected response format:', response);
          this.recentOrders = [];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.error = 'Failed to load orders';
        this.loading = false;
      },
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      RECEIVED: 'warning',
      PREPARING: 'primary',
      READY: 'success',
      COMPLETED: 'medium',
    };
    return colors[status] || 'danger';
  }
}