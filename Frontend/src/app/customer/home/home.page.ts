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
        let orderList = orders?.results.filter(
          (order: any) => order.status !== 'COMPLETED'
        );;

        // Assign the filtered and sliced list
        this.recentOrders = orderList.slice(0, 5);
        this.refreshUserProfile();
        
        console.log('Recent orders loaded:', this.recentOrders.length);
      },
      error: (err) => console.error('Failed to load orders', err),
    });

    // Load favourites
    this.apiService.getFavourites().subscribe({
      next: (favs: any) => {
        this.favourites = Array.isArray(favs) ? favs : favs?.results || [];
        console.log('Favourites loaded:', this.favourites.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load favourites', err);
        this.loading = false;
      },
    });
  }

  onFavoriteClick(fav: Favourite): void {
    this.router.navigate(['/order-details', fav.template_order]);
  }
  
  refreshUserProfile(): void {
    // Refresh user profile to get updated loyalty points
    this.apiService.getProfile().subscribe({
      next: (userData) => {
        this.authService.updateUserData(userData);
        console.log(
          'User profile refreshed, points:',
          userData.loyalty_points
        );
      },
      error: (err) => console.error('Failed to refresh profile', err),
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
  ) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      RECEIVED: 'warning',
      PREPARING: 'primary',
      READY: 'success',
    };
    return colors[status] || 'medium';
  }

  
  onOrderClick(order: Order): void {
      this.router.navigate(['/order-details', order.id]);
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

  reorderFavorite(fav: Favourite): void {
    this.apiService.reorderFromFavourite(fav.id).subscribe({
      next: (order) => {
        console.log('Reordered from favorite');
        this.showToastMessage('Order placed successfully!', 'success');
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to reorder', err);
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
