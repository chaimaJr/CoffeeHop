import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonInput, IonTextarea, IonSpinner, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { MenuItem } from 'src/app/models/menu-item.model';
import { OrderItem } from 'src/app/models/order.model';


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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonButton,
    IonInput,
    IonTextarea,
    IonSpinner,
    IonRadioGroup,
    IonRadio,
  ],
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Menu items categorized
  coffees: MenuItem[] = [];
  desserts: MenuItem[] = [];

  // User selections
  selectedCoffee: MenuItem | null = null;
  selectedDesserts: MenuItem[] = [];
  quantity = 1;
  notes = '';

  // State
  loading = true;
  submitting = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.apiService.getMenuItems().subscribe({
      next: (response: any) => {
        let items: MenuItem[] = [];
          items = response.results;
        

        // Categorize items
        this.coffees = items.filter(item => 
          item.item_type === 'COFFEE' && item.is_available
        );

        this.desserts = items.filter(item => 
          item.item_type === 'DESSERT' && item.is_available
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load menu', err);
        this.error = 'Failed to load menu items';
        this.loading = false;
      },
    });
  }

  selectCoffee(coffee: MenuItem): void {
    this.selectedCoffee = coffee;
  }

  toggleDessert(dessert: MenuItem): void {
    const index = this.selectedDesserts.findIndex(d => d.id === dessert.id);
    if (index > -1) {
      this.selectedDesserts.splice(index, 1);
    } else {
      this.selectedDesserts.push(dessert);
    }
  }

  isDessertSelected(dessert: MenuItem): boolean {
    return this.selectedDesserts.some(d => d.id === dessert.id);
  }

  get totalPrice(): number {
    let total = 0;
    
    if (this.selectedCoffee) {
      total += Number(this.selectedCoffee.price);
    }
    
    this.selectedDesserts.forEach(d => {
      total += Number(d.price);
    });
    
    return total * this.quantity;
  }

  get canPlaceOrder(): boolean {
    return !!this.selectedCoffee && this.quantity > 0;
  }

  placeOrder(): void {
    if (!this.canPlaceOrder) return;

    this.submitting = true;
    this.error = null;

    const orderItems: OrderItem[] = [];

    // Add coffee
    if (this.selectedCoffee) {
      orderItems.push({
        menu_item: this.selectedCoffee.id,
        quantity: this.quantity,
        price: Number(this.selectedCoffee.price),
        customizations: this.notes || ''
      });
    }

    // Add desserts
    this.selectedDesserts.forEach(dessert => {
      orderItems.push({
        menu_item: dessert.id,
        quantity: this.quantity, // Assuming desserts have the same quantity as coffee
        price: Number(dessert.price),
        customizations: ''
      });
    });

    const payload = {
      order_items: orderItems,
      notes: this.notes || '',
    };

    console.log('Placing order:', payload);

    // Create new order
    this.apiService.createOrder(payload).subscribe({
      next: (order) => {
        console.log('Order placed:', order);
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        console.error('Order failed:', err);
        this.error = 'Failed to place order. Please try again.';
        this.submitting = false;
      }
    });
  }

  resetOrder(): void {
    this.selectedCoffee = null;
    this.selectedDesserts = [];
    this.quantity = 1;
    this.notes = '';
  }
}