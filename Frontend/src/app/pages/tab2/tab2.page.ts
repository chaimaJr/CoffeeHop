import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonContent, IonSpinner, IonGrid, IonRow, IonCol, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonHeader, IonTitle, IonToolbar, IonBadge } from '@ionic/angular/standalone';
import { MenuItem } from 'src/app/models/menu-item.model';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [CommonModule, IonBadge, IonToolbar, IonTitle, IonHeader, IonButton, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonImg, IonCard, IonCol, IonRow, IonGrid, IonSpinner, IonContent]
})
export class Tab2Page implements OnInit {
  menuItems: MenuItem[] = [];
  isLoading = true;
  cart: { menuItemId: number; quantity: number }[] = [];

  constructor(private menuService: MenuService) {}

  ngOnInit() {
    this.loadMenu();
  }

  loadMenu() {
    this.isLoading = true;
    this.menuService.getMenuItems().subscribe({
      next: (response: any) => {
        this.menuItems = response ?? [];
        console.log('Menu items set to:', this.menuItems); 
        this.isLoading = false;
      },
      error: (err) => {
        this.menuItems = [];
        console.error('Failed to load menu:', err);
        this.isLoading = false;
      },
    });
  }

  addToCart(item: MenuItem) {
    const existingItem = this.cart.find((c) => c.menuItemId === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ menuItemId: item.id, quantity: 1 });
    }
  }

  getCartTotal(): number {
    return this.cart.length;
  }

  placeOrder() {
    console.log('Order placed:', this.cart);
    // TODO: Call OrderService.submitOrder(this.cart)
  }
}
