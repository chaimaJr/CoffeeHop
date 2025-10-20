import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonInput, IonTextarea, IonSpinner, IonRadioGroup, IonRadio, IonChip, IonDatetimeButton, IonModal, IonDatetime, IonToggle } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { MenuItem } from 'src/app/models/menu-item.model';

interface OrderItem {
  menu_item: number;
  quantity: number;
  price: number;
  customizations: string;
}

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
  toppings: MenuItem[] = [];
  desserts: MenuItem[] = [];

  // User selections
  selectedCoffee: MenuItem | null = null;
  selectedToppings: MenuItem[] = [];
  selectedDesserts: MenuItem[] = [];
  quantity = 1;
  notes = '';

  // Scheduling
  isScheduled = false;
  scheduledTime: string | null = null;

  // Edit mode
  editingOrderId: number | null = null;
  isEditMode = false;

  loading = true;
  submitting = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadMenuItems();
    this.checkForEditMode();
  }

  checkForEditMode(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || (history.state as any);
    
    if (state?.editOrder) {
      const order = state.editOrder;
      console.log('✏️ Edit mode activated for order:', order);
      this.isEditMode = true;
      this.editingOrderId = order.id;
      this.notes = order.notes || '';
      
      // Store order items to populate after menu loads
      setTimeout(() => this.populateOrderForEdit(order), 500);
    }
  }

  populateOrderForEdit(order: any): void {
    if (!order.order_items || order.order_items.length === 0) return;

    // Pre-select items based on order_items
    order.order_items.forEach((item: any) => {
      const menuItemId = item.menu_item?.id || item.menu_item;
      
      // Find in coffees
      const coffee = this.coffees.find(c => c.id === menuItemId);
      if (coffee) {
        this.selectedCoffee = coffee;
        this.quantity = item.quantity;
        return;
      }
      
      // Find in toppings
      const topping = this.toppings.find(t => t.id === menuItemId);
      if (topping && !this.isToppingSelected(topping)) {
        this.selectedToppings.push(topping);
        return;
      }
      
      // Find in desserts
      const dessert = this.desserts.find(d => d.id === menuItemId);
      if (dessert && !this.isDessertSelected(dessert)) {
        this.selectedDesserts.push(dessert);
      }
    });

    console.log('✅ Order populated for editing');
  }

  loadMenuItems(): void {
    this.apiService.getMenuItems().subscribe({
      next: (response: any) => {
        console.log('📋 Menu response:', response);

        let items: MenuItem[] = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.results) {
          items = response.results;
        } else if (response?.data) {
          items = response.data;
        }

        // Categorize items
        this.coffees = items.filter(item => 
          item.item_type === 'COFFEE' && item.is_available
        );

        this.desserts = items.filter(item => 
          item.item_type === 'DESSERT' && item.is_available
        );

        console.log('✅ Coffees:', this.coffees.length, 'Desserts:', this.desserts.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load menu', err);
        this.error = 'Failed to load menu items';
        this.loading = false;
      },
    });
  }

  selectCoffee(coffee: MenuItem): void {
    this.selectedCoffee = coffee;
  }

  toggleTopping(topping: MenuItem): void {
    const index = this.selectedToppings.findIndex(t => t.id === topping.id);
    if (index > -1) {
      this.selectedToppings.splice(index, 1);
    } else {
      this.selectedToppings.push(topping);
    }
  }

  isToppingSelected(topping: MenuItem): boolean {
    return this.selectedToppings.some(t => t.id === topping.id);
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

  onScheduleToggle(): void {
    if (!this.isScheduled) {
      this.scheduledTime = null;
    }
  }

  onDateTimeChange(event: any): void {
    this.scheduledTime = event.detail.value;
    console.log('📅 Scheduled for:', this.scheduledTime);
  }

  get totalPrice(): number {
    let total = 0;
    
    if (this.selectedCoffee) {
      total += Number(this.selectedCoffee.price);
    }
    
    this.selectedToppings.forEach(t => {
      total += Number(t.price);
    });
    
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

    // Add toppings
    this.selectedToppings.forEach(topping => {
      orderItems.push({
        menu_item: topping.id,
        quantity: this.quantity,
        price: Number(topping.price),
        customizations: ''
      });
    });

    // Add desserts
    this.selectedDesserts.forEach(dessert => {
      orderItems.push({
        menu_item: dessert.id,
        quantity: this.quantity,
        price: Number(dessert.price),
        customizations: ''
      });
    });

    const payload = {
      order_items: orderItems,
      notes: this.notes || '',
      scheduled_for: this.isScheduled && this.scheduledTime ? this.scheduledTime : null
    };

    console.log('📤 Placing order:', payload);

    // Update existing order or create new one
    const request = this.isEditMode && this.editingOrderId
      ? this.apiService.updateOrder(this.editingOrderId, payload)
      : this.apiService.createOrder(payload);

    request.subscribe({
      next: (order) => {
        console.log(this.isEditMode ? '✅ Order updated:' : '✅ Order placed:', order);
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        console.error('❌ Order failed:', err);
        this.error = this.isEditMode 
          ? 'Failed to update order. Please try again.'
          : 'Failed to place order. Please try again.';
        this.submitting = false;
      }
    });
  }

  resetOrder(): void {
    this.selectedCoffee = null;
    this.selectedToppings = [];
    this.selectedDesserts = [];
    this.quantity = 1;
    this.notes = '';
    this.isScheduled = false;
    this.scheduledTime = null;
  }
}