import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private ws: WebSocket | null = null;
  orderUpdates$ = new Subject<{ 
    orderId: number; 
    status: string; 
    message: string 
  }>();

  connect(orderId: number, token: string) {
    const url = `ws://localhost:8000/ws/orders/${orderId}/?token=${token}`;
    this.ws = new WebSocket(url);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.orderUpdates$.next(data);
    };
    
    this.ws.onerror = () => {
      // Fallback: poll backend every 3 seconds if WS fails
    };
  }

  disconnect(orderId: number) {
    this.ws?.close();
  }
}
