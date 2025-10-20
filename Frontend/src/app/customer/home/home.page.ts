import { Component, OnInit, inject, signal } from '@angular/core';
import { Order } from 'src/app/models/order.model';
import { FavouriteOrder as Favourite } from 'src/app/models/favourite-order.model';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonList,
  IonListHeader,
  IonLabel,
  IonBadge,
  IonIcon,
  IonItem,
  IonModal,
  IonButtons,
  IonInput,
  IonActionSheet,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonChip,
  IonToast,
  IonRadio,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import {
  star,
  starOutline,
  heart,
  heartOutline,
  trashOutline,
  createOutline,
  refreshOutline,
} from 'ionicons/icons';
import { AlertController } from '@ionic/angular';

addIcons({
  star,
  starOutline,
  heart,
  heartOutline,
  trashOutline,
  createOutline,
  refreshOutline,
});

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonListHeader,
    IonLabel,
    IonBadge,
    IonIcon,
    IonItem,
    IonModal,
    IonButtons,
    IonInput,
    IonActionSheet,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonToast,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {
      addIcons({refreshOutline,trashOutline});}

  user = this.authService.currentUser;
  recentOrders: Order[] = [];
  favourites: Favourite[] = [];

  loading = true;
  selectedOrder: Order | null = null;
  showSaveFavModal = false;
  favoriteName = '';

  // Action sheet
  showActionSheet = false;
  actionSheetButtons: any[] = [];

  // Toast notifications
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  ngOnInit(): void {
    this.loadData();
  }

  ionViewWillEnter(): void {
    // Reload data and user profile when page becomes active
    this.loadData();
    this.refreshUserProfile();
  }

  loadData(): void {
    this.loading = true;

    // Load recent orders
    this.apiService.getMyOrders().subscribe({
      next: (orders: any) => {
        const orderList = Array.isArray(orders)
          ? orders
          : orders?.results || [];
        this.recentOrders = orderList.slice(0, 5);
        console.log('✅ Recent orders loaded:', this.recentOrders.length);
      },
      error: (err) => console.error('❌ Failed to load orders', err),
    });

    // Load favourites
    this.apiService.getFavourites().subscribe({
      next: (favs: any) => {
        this.favourites = Array.isArray(favs) ? favs : favs?.results || [];
        console.log('✅ Favourites loaded:', this.favourites.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load favourites', err);
        this.loading = false;
      },
    });
  }

  refreshUserProfile(): void {
    // Refresh user profile to get updated loyalty points
    this.apiService.getProfile().subscribe({
      next: (userData) => {
        this.authService.updateUserData(userData);
        console.log(
          '✅ User profile refreshed, points:',
          userData.loyalty_points
        );
      },
      error: (err) => console.error('❌ Failed to refresh profile', err),
    });
  }

  handleRefresh(event: any): void {
    this.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  showToastMessage(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
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

  
  onOrderClick(order: Order): void {
    // if (order.status === 'RECEIVED') {
      // If the order is new, show options to modify it
      // this.openOrderActions(order);
    // } else {
      // Otherwise, just navigate to details page
      this.router.navigate(['/order-details', order.id]);
    // }
  }

  openOrderActions(order: Order): void {
    this.selectedOrder = order;

    this.actionSheetButtons = [
      {
        text: 'Save as Favorite',
        icon: 'heart-outline',
        handler: () => this.openSaveFavoriteModal(order),
      },
    ];

    // Only allow updates if order is RECEIVED
    if (order.status === 'RECEIVED') {
      this.actionSheetButtons.push({
        text: 'Update Order',
        icon: 'create-outline',
        handler: () => this.updateOrder(order),
      });
      this.actionSheetButtons.push({
        text: 'Cancel Order',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => this.cancelOrder(order),
      });
    }

    this.actionSheetButtons.push({
      text: 'Close',
      role: 'cancel',
    });

    this.showActionSheet = true;
  }

  updateOrder(order: Order): void {
    // Navigate to order page with order data for editing
    this.router.navigate(['/tabs/order'], {
      state: { editOrder: order },
    });
  }

  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.apiService.cancelOrder(order.id).subscribe({
        next: () => {
          this.recentOrders = this.recentOrders.filter(
            (o) => o.id !== order.id
          );
          console.log('✅ Order cancelled');
        },
        error: (err) => console.error('❌ Failed to cancel order', err),
      });
    }
  }

  openSaveFavoriteModal(order: Order): void {
    this.selectedOrder = order;
    this.favoriteName = '';
    this.showSaveFavModal = true;
  }

  saveFavorite(): void {
    if (!this.selectedOrder || !this.favoriteName.trim()) return;

    this.apiService
      .saveFavourite(this.favoriteName, this.selectedOrder.id)
      .subscribe({
        next: (fav) => {
          this.favourites.push(fav);
          this.showSaveFavModal = false;
          this.favoriteName = '';
          console.log('✅ Favorite saved to database');
          this.showToastMessage(`"${fav.name}" saved to favorites!`, 'success');
        },
        error: (err) => {
          console.error('❌ Failed to save favorite', err);
          this.showToastMessage(
            'Failed to save favorite. Please try again.',
            'danger'
          );
        },
      });
  }

  reorderFavorite(fav: Favourite): void {
    this.apiService.reorderFromFavourite(fav.id).subscribe({
      next: (order) => {
        console.log('✅ Reordered from favorite');
        this.showToastMessage('Order placed successfully!', 'success');
        this.router.navigate(['/tabs/home']);
        this.loadData();
      },
      error: (err) => {
        console.error('❌ Failed to reorder', err);
        this.showToastMessage('Failed to reorder. Please try again.', 'danger');
      },
    });
  }



  async deleteFavorite(fav: Favourite) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: `Delete "${fav.name}" from favorites?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.apiService.deleteFavourite(fav.id).subscribe({
              next: () => {
                this.favourites = this.favourites.filter(
                  (f) => f.id !== fav.id
                );
                console.log('Favorite deleted');
              },
              error: (err) => console.error('Failed to delete favorite', err),
            });
          },
        },
      ],
    });

    await alert.present();

  }
}
