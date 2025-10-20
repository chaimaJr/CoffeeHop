import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonIcon, IonList, IonListHeader, IonBadge, IonModal, IonButtons, IonInput, IonSpinner, IonToast } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { addIcons } from 'ionicons';
import { logOut, star, person, notifications, gift, createOutline } from 'ionicons/icons';
import { ViewWillEnter } from '@ionic/angular';

addIcons({ logOut, star, person, notifications, gift, createOutline });

interface LoyaltyOffer {
  id: number;
  title: string;
  description: string;
  points_required: number;
  is_active: boolean;
}

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
    IonToast
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

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

  // Redemption
  redeemingOfferId: number | null = null;

  ngOnInit(): void {
    this.loadLoyaltyOffers();
    if (this.user()?.phone) {
      this.editPhone = this.user()!.phone;
    }
  }

  loadLoyaltyOffers(): void {
    this.loadingOffers = true;
    this.apiService.getLoyaltyOffers().subscribe({
      next: (offers: any) => {
        this.loyaltyOffers = Array.isArray(offers) ? offers : offers?.results || [];
        console.log('✅ Loyalty offers loaded:', this.loyaltyOffers.length);
        this.loadingOffers = false;
      },
      error: (err) => {
        console.error('❌ Failed to load loyalty offers', err);
        this.loadingOffers = false;
      }
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
      }
    });
  }

  canRedeemOffer(offer: LoyaltyOffer): boolean {
    const points = this.user()?.loyalty_points || 0;
    return points >= offer.points_required && offer.is_active;
  }

  redeemOffer(offer: LoyaltyOffer): void {
    if (!this.canRedeemOffer(offer)) {
      this.showToastMessage('Not enough points to redeem this offer', 'warning');
      return;
    }

    if (!confirm(`Redeem "${offer.title}" for ${offer.points_required} points?`)) {
      return;
    }

    this.redeemingOfferId = offer.id;

    this.apiService.redeemLoyaltyOffer(offer.id).subscribe({
      next: (response) => {
        console.log('✅ Offer redeemed:', response);
        
        // Update user's loyalty points
        const currentUser = this.user();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            loyalty_points: currentUser.loyalty_points - offer.points_required
          };
          this.authService.updateUserData(updatedUser);
        }

        this.showToastMessage(
          `🎉 ${offer.title} redeemed! Use code: ${response.redemption_code || 'N/A'}`,
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
      }
    });
  }

  showToastMessage(message: string, color: 'success' | 'danger' | 'warning' = 'success'): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}