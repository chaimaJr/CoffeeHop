import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonToggle, IonDatetime, IonToast, IonButtons, IonBackButton, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { CartItem, CartService } from 'src/app/services/cart.service';
import { CreateOrderPayload } from 'src/app/models/order.model';

@Component({
  selector: 'app-checkout',
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
    IonTextarea,
    IonButton,
    IonToggle,
    IonDatetime,
    IonToast,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private router = inject(Router);

  cartItems: CartItem[] = [];
  total = this.cartService.total;
  notes = '';
  isScheduled = false;
  scheduledTime = '';
  loading = false;
  success = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cartItems = this.cartService.getCart();
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.error = 'Cart is empty';
      return;
    }

    this.loading = true;

    const payload: CreateOrderPayload = {
      items: this.cartItems.map((item) => ({
        menu_item: item.menuItem.id,
        quantity: item.quantity,
        customizations: item.customizations,
        price: item.menuItem.price,
      })),
      total_price: this.total(),
      notes: this.notes,
    };

    this.apiService.createOrder(payload).subscribe({
      next: () => {
        this.success = true;
        this.cartService.clearCart();
        this.loading = false;
        setTimeout(() => this.router.navigate(['/tabs/home']), 1500);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Failed to place order';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/order']);
  }
}