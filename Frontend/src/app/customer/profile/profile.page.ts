import { Component, OnInit } from '@angular/core';
import { LoyaltyOffer } from 'src/app/models/loyalty-offer.model';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonListHeader,
  IonBadge,
  IonModal,
  IonButtons,
  IonInput,
  IonSpinner,
  IonToast,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { addIcons } from 'ionicons';
import {
  logOut,
  star,
  person,
  notifications,
  gift,
  createOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { AlertController } from '@ionic/angular';

addIcons({
  logOut,
  star,
  person,
  notifications,
  gift,
  createOutline,
  chevronBackOutline,
});

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonListHeader,
    IonBadge,
    IonModal,
    IonButtons,
    IonInput,
    IonSpinner,
    IonToast,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ createOutline, star, logOut, chevronBackOutline });
  }

  user = this.authService.currentUser;
  loyaltyOffers: LoyaltyOffer[] = [];

  showEditProfileModal = false;
  editPhone = '';
  updatingProfile = false;
  loadingOffers = false;

  // Toast notifications
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  // Loyalty points Redemption
  redeemingOfferId: number | null = null;

  ngOnInit(): void {
    this.loadLoyaltyOffers();
    if (this.user()?.phone) {
      this.editPhone = this.user()!.phone;
    }
  }

  loadLoyaltyOffers(): void {
    this.apiService.getLoyaltyOffers().subscribe({
      next: (offers: any) => {
        this.loyaltyOffers = offers?.results || [];
        console.log('Loyalty offers loaded:', this.loyaltyOffers.length);
      },
      error: (err) => {
        console.error('Failed to load loyalty offers', err);
      },
    });
  }

  openEditProfile(): void {
    this.editPhone = this.user()?.phone || '';
    this.showEditProfileModal = true;
  }

  updateProfile(): void {
    this.updatingProfile = true;

    this.apiService.updateProfile({ phone: this.editPhone }).subscribe({
      next: (updated) => {
        console.log('✅ Profile updated');
        this.authService.updateUserData(updated);
        this.showEditProfileModal = false;
        this.updatingProfile = false;
        this.showToastMessage('Profile updated successfully!', 'success');
      },
      error: (err) => {
        console.error('❌ Failed to update profile', err);
        this.updatingProfile = false;
        this.showToastMessage('Failed to update profile', 'danger');
      },
    });
  }

  canRedeemOffer(offer: LoyaltyOffer): boolean {
    const points = this.user()?.loyalty_points || 0;
    return points >= offer.points_required && offer.is_active;
  }

  async redeemOffer(offer: LoyaltyOffer) {
    if (!this.canRedeemOffer(offer)) {
      this.showToastMessage(
        'Not enough points to redeem this offer',
        'warning'
      );
      return;
    }

    const alert = await this.alertController.create({
      header: 'Redeem?',
      message: `Redeem "${offer.title}" for ${offer.points_required} points?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Redeem',
          handler: () => {
            this.redeemingOfferId = offer.id;

            this.apiService.redeemLoyaltyOffer(offer.id).subscribe({
              next: (response) => {
                console.log('✅ Offer redeemed:', response);

                // Update user's loyalty points
                const currentUser = this.user();
                if (currentUser) {
                  const updatedUser = {
                    ...currentUser,
                    loyalty_points:
                      currentUser.loyalty_points - offer.points_required,
                  };
                  this.authService.updateUserData(updatedUser);
                }

                this.showToastMessage(
                  `🎉 ${offer.title} redeemed! Use code: ${
                    response.redemption_code || 'N/A'
                  }`,
                  'success'
                );

                this.redeemingOfferId = null;
              },
              error: (err) => {
                console.error('❌ Failed to redeem offer', err);
                this.showToastMessage(
                  err.error?.message || 'Failed to redeem offer',
                  'danger'
                );
                this.redeemingOfferId = null;
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  showToastMessage(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout?',
      message: `Are you sure you want to logout?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
  }
}
