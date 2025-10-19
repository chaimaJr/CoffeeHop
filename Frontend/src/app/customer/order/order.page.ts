import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonButton, IonModal, IonButtons, IonInput, IonTextarea, IonFab, IonFabButton, IonIcon, IonBadge, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, cart } from 'ionicons/icons';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { MenuItem } from 'src/app/models/menu-item.model';

addIcons({ add, cart });

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonButton,
    IonModal,
    IonButtons,
    IonInput,
    IonTextarea,
    IonFab,
    IonFabButton,
    IonIcon,
    IonBadge,
    IonSpinner,
  ],
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  cartService = inject(CartService);

  selectedType: 'COFFEE' | 'DESSERT' = 'COFFEE';
  allItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  
  // Use the signal directly - no async pipe needed
  get cart() {
    return this.cartService.cart$();
  }

  get itemCount() {
    return this.cartService.itemCount();
  }

  showItemDetail = false;
  selectedItem: MenuItem | null = null;
  itemQuantity = 1;
  itemNotes = '';
  loading = true;

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.apiService.getMenuItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.onTypeChange();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load menu', err);
        this.loading = false;
      },
    });
  }

  onTypeChange(): void {
    this.filteredItems = this.allItems.filter((item) => item.item_type === this.selectedType);
  }

  addItem(item: MenuItem): void {
    this.selectedItem = item;
    this.itemQuantity = 1;
    this.itemNotes = '';
    this.showItemDetail = true;
  }

  confirmAdd(): void {
    if (this.selectedItem) {
      this.cartService.addToCart(this.selectedItem, this.itemQuantity, this.itemNotes);
      this.showItemDetail = false;
    }
  }

  goToCheckout(): void {
    if (this.cart.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }
}