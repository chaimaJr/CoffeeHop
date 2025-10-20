// src/app/pages/order-details/order-details.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; // Added Pipes
import { ActivatedRoute } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton,
  IonSpinner,
  IonCard,
  IonCardHeader, // Added
  IonCardTitle,  // Added
  IonCardContent,// Added
  IonList,       // Added
  IonItem,
  IonLabel,
  IonBadge,      // Added
  IonNote,       // Added
  IonToast, 
  IonButton, 
  IonInput, 
  IonModal, 
  IonIcon 
} from '@ionic/angular/standalone';
import { ApiService } from 'src/app/services/api.service';
import { Order } from 'src/app/models/order.model';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons'; // Added
import { heartOutline } from 'ionicons/icons'; // Added

addIcons({ heartOutline }); // Added

@Component({
  selector: 'app-order-details',
  standalone: true,
  // 
  // *** THIS IMPORT ARRAY IS NOW CORRECT ***
  // Your file was missing most of these
  //
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonNote,
    IonToast, 
    IonButton, 
    IonInput, 
    IonModal, 
    IonIcon
  ],
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {

  // ... (The rest of your code is correct) ...
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  order: Order | null = null;
  loading = true;
  error: string | null = null;
  showSaveFavModal = false;
  favoriteName = '';
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';


  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(+orderId);
      
    } else {
      this.error = 'No order ID provided.';
      this.loading = false;
    }
  }
  
  loadOrderDetails(id: number) {
    this.loading = true;
    this.error = null;

    this.apiService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
        console.log(this.order);
      },
      error: (err) => {
        this.error = 'Failed to load order details.';
        this.loading = false;
        console.error('Error loading order:', err);
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      RECEIVED: 'warning',
      PREPARING: 'primary',
      READY: 'success',
      COMPLETED: 'medium',
      CANCELLED: 'danger',
    };
    return colors[status] || 'medium';
  }
  

  showToastMessage(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }
  
  openSaveFavoriteModal(): void {
    if (!this.order) return;
    this.favoriteName = '';
    this.showSaveFavModal = true;
  }

  saveFavorite(): void {
    if (!this.order || !this.favoriteName.trim()) return;

    this.apiService
      .saveFavourite(this.favoriteName, this.order.id)
      .subscribe({
        next: (fav) => {
          this.showSaveFavModal = false;
          this.favoriteName = '';
          console.log('Favorite saved to database');
          this.showToastMessage(`"${fav.name}" saved to favorites!`, 'success');
        },
        error: (err) => {
          console.error('Failed to save favorite', err);
          this.showToastMessage(
            'Failed to save favorite. Please try again.',
            'danger'
          );
        },
      });
  }
}