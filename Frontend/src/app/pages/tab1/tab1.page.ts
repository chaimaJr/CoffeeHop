import { OrderService } from './../../services/order/order.service';
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page {
  constructor(private orderService: OrderService) {}

  /*
  List of active orders (status != COMPLETED/CANCELLED)
  Status badge (RECEIVED, PREPARING, READY)
  Click → Open modal showing order details + items
  Real-time status updates via WebSocket
  

  Implementation Flow:

  Load orders from orderService.getMyOrders()
  For each active order, connect WebSocket listener
  Update UI when status changes
  Show "No active orders" if list empty

  */



  // ngOnInit() {
  //   this.loadOrders();
  // }

  
  // loadOrders() {
  //   this.orderService.getMyOrders().subscribe(orders => {
  //     this.activeOrders = orders.filter(o => o.status !== 'COMPLETED');
      
  //     // Connect WebSocket for each order
  //     this.activeOrders.forEach(order => {
  //       this.websocketService.connect(order.id, token);
  //     });
  //   });
  // }

  // // Listen for real-time updates
  // this.websocketService.orderUpdates$.subscribe(update => {
  //   // Update order in list with new status
  // });
}
