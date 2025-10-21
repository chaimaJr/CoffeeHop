import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonInput, IonTextarea, IonSpinner, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { MenuItem } from 'src/app/models/menu-item.model';

/**
 * @block IMPORTS
 * @purpose This is where we import all the necessary tools and blueprints.
 * - Angular imports (Component, OnInit, inject) are the core building blocks.
 * - Ionic imports (IonHeader, IonButton, etc.) are the UI components for the view.
 * - CommonModule gives us access to features like *ngIf and *ngFor in the HTML.
 * - FormsModule is essential for Template-Driven Forms (it enables [(ngModel)]).
 * - Router is used to navigate to a new page (like back to home) after success.
 * - ApiService is how we communicate with our backend.
 * - MenuItem is our "blueprint" for what a menu item object looks like.
 */

/**
 * @block OrderItem Interface
 * @purpose This is a local "blueprint" defining the *exact* data structure
 * the backend API expects when we *create* a new order. It's a "Write Model" or "Payload".
 * Notice it only needs the `menu_item` ID (a number), not the whole object.
 */
interface OrderItem {
  menu_item: number;
  quantity: number;
  price: number;
  customizations: string;
}

/**
 * @block @Component Decorator
 * @purpose This is the main configuration object for our component.
 * It links this TypeScript file (the logic) to its HTML file (the view)
 * and declares all the modules and components it uses in its `imports` array.
 */
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Enables [(ngModel)] for our template-driven form
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
  /**
   * @block CLASS PROPERTIES
   * @purpose This section is the component's "memory". It holds all the
   * data and state needed for the page to function.
   */

  // --- 1. Services ---
  // We use `inject` to get the instances of the services we need.
  private apiService = inject(ApiService);
  private router = inject(Router);

  // --- 2. Data Arrays ---
  // These arrays will be filled with data from the API.
  coffees: MenuItem[] = [];
  desserts: MenuItem[] = [];

  // --- 3. Form State ---
  // These variables are linked to the UI using [(ngModel)].
  // They store what the user selects.
  selectedCoffee: MenuItem | null = null;
  selectedDesserts: MenuItem[] = [];
  quantity = 1;
  notes = '';

  // --- 4. UI State ---
  // These are "switches" to control what the user sees.
  loading = true;     // Show spinner when true
  submitting = false; // Show spinner on button when true
  error: string | null = null; // Holds an error message to display

  /**
   * @block ngOnInit (Lifecycle Hook)
   * @purpose This function runs automatically *one time* when the component
   * is first created. It's the perfect place to start loading our data.
   */
  ngOnInit(): void {
    this.loadMenuItems();
  }

  /**
   * @block loadMenuItems
   * @purpose Fetches the menu from the API and populates our local data arrays.
   */
  loadMenuItems(): void {
    this.apiService.getMenuItems().subscribe({
      // This `next` block runs if the API call is SUCCESSFUL
      next: (response: any) => {
        let items: MenuItem[] = [];
        // The API response is paginated, so our data is in `response.results`
        items = response.results;
        
        // Filter the items into two separate lists for the UI
        this.coffees = items.filter(item => 
          item.item_type === 'COFFEE' && item.is_available
        );
        this.desserts = items.filter(item => 
          item.item_type === 'DESSERT' && item.is_available
        );

        // Turn off the loading spinner
        this.loading = false;
      },
      // This `error` block runs if the API call FAILS
      error: (err) => {
        console.error('Failed to load menu', err);
        this.error = 'Failed to load menu items';
        this.loading = false; // Also turn off spinner on error
      },
    });
  }

  /**
   * @block SELECTION HELPERS (selectCoffee, toggleDessert, isDessertSelected)
   * @purpose These functions are called by the HTML to update the form state
   * when the user interacts with the radio buttons and checkboxes.
   */
  selectCoffee(coffee: MenuItem): void {
    this.selectedCoffee = coffee;
  }

  toggleDessert(dessert: MenuItem): void {
    // Check if the dessert is already in the array
    const index = this.selectedDesserts.findIndex(d => d.id === dessert.id);
    if (index > -1) {
      // If it is, remove it (uncheck)
      this.selectedDesserts.splice(index, 1);
    } else {
      // If it's not, add it (check)
      this.selectedDesserts.push(dessert);
    }
  }

  isDessertSelected(dessert: MenuItem): boolean {
    // This is used by the checkbox `[checked]` property to know if it should be ticked
    return this.selectedDesserts.some(d => d.id === dessert.id);
  }

  /**
   * @block GETTERS (Computed Properties)
   * @purpose These `get` functions act like variables, but their values
   * are automatically re-calculated whenever their "ingredients" change.
   */

  // Calculates the total price based on current selections
  get totalPrice(): number {
    let total = 0;
    
    if (this.selectedCoffee) {
      total += Number(this.selectedCoffee.price);
    }
    
    this.selectedDesserts.forEach(d => {
      total += Number(d.price);
    });
    
    // Apply quantity to the total
    return total * this.quantity;
  }

  // Checks if the form is valid enough to place an order
  get canPlaceOrder(): boolean {
    // Must select a coffee and have at least 1
    return !!this.selectedCoffee && this.quantity > 0;
  }

  /**
   * @block placeOrder
   * @purpose This is the main action, called by the "Place Order" button.
   * It builds the payload and sends it to the API.
   */
  placeOrder(): void {
    // 1. Guard Clause: Stop if the form is invalid
    if (!this.canPlaceOrder) return;

    // 2. Set UI State: Show spinner, clear old errors
    this.submitting = true;
    this.error = null;

    // 3. Build Payload: Create the `orderItems` array in the format the API expects
    const orderItems: OrderItem[] = [];

    // Add the selected coffee
    if (this.selectedCoffee) {
      orderItems.push({
        menu_item: this.selectedCoffee.id,
        quantity: this.quantity,
        price: Number(this.selectedCoffee.price),
        customizations: this.notes || '' // Use notes for coffee customizations
      });
    }

    // Add all selected desserts
    this.selectedDesserts.forEach(dessert => {
      orderItems.push({
        menu_item: dessert.id,
        quantity: this.quantity, // Assuming same quantity for simplicity
        price: Number(dessert.price),
        customizations: '' // Desserts have no customizations in this form
      });
    });

    // 4. Finalize Payload: Wrap `orderItems` and `notes` in the final object
    const payload = {
      order_items: orderItems,
      notes: this.notes || '',
    };

    console.log('Placing order:', payload);

    // 5. Send to API: Call the `createOrder` function and "subscribe"
    this.apiService.createOrder(payload).subscribe({
      // If successful, log it and navigate home
      next: (order) => {
        console.log('Order placed:', order);
        this.router.navigate(['/tabs/home']);
      },
      // If it fails, show an error and stop the spinner
      error: (err) => {
        console.error('Order failed:', err);
        this.error = 'Failed to place order. Please try again.';
        this.submitting = false; // Allow user to try again
      }
    });
  }

  /**
   * @block resetOrder
   * @purpose Called by the "Reset" button. It clears the form by
   * setting all the state variables back to their defaults.
   */
  resetOrder(): void {
    this.selectedCoffee = null;
    this.selectedDesserts = [];
    this.quantity = 1;
    this.notes = '';
  }
}