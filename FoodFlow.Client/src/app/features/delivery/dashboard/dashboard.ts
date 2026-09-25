import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  orders = signal<any[]>([]);
  deliveryPartner = signal<any>(null);
  notification = signal<string | null>(null);

  private hubConnection!: signalR.HubConnection;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadDeliveryPartnerProfile();
  }

  loadOrders(): void {
    this.orderService.getDeliveryPartnerOrders().subscribe({
      next: data => {
        this.orders.set(data);
        console.log('Delivery Orders:', data);
      },
      error: error => {
        console.error('Failed to load delivery orders:', error);
      }
    });
  }

  loadDeliveryPartnerProfile(): void {
    this.orderService.getDeliveryPartnerProfile().subscribe({
      next: data => {
        this.deliveryPartner.set(data);

        console.log('Delivery Partner Profile:', data);

        // Start SignalR after we know the partner ID
        this.startSignalR(data.id);
      },
      error: error => {
        console.error('Failed to load delivery partner profile:', error);
      }
    });
  }

  startSignalR(deliveryPartnerId: number): void {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://foodflow-api-st1v.onrender.com/orderHub', {
        accessTokenFactory: () =>
          localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    // When restaurant assigns a new order
   this.hubConnection.on(
  'OrderAssigned',
  (data: {
    orderId: number;
    status: string;
    restaurantName: string;
  }) => {

    console.log('New order received:', data);

    // Show notification
    this.notification.set(
      `New order received from ${data.restaurantName}`
    );

    // Automatically refresh orders
    this.loadOrders();

    // Hide notification after 5 seconds
    setTimeout(() => {
      this.notification.set(null);
    }, 5000);
  }
);

    this.hubConnection.start()
      .then(async () => {

        console.log('SignalR connected successfully.');

        // Join this delivery partner's group
        await this.hubConnection.invoke(
          'JoinDeliveryPartnerGroup',
          deliveryPartnerId
        );

        console.log(
          `Joined delivery-partner-${deliveryPartnerId}`
        );
      })
      .catch(error => {
        console.error('SignalR connection failed:', error);
      });
  }

  acceptDelivery(orderId: number): void {
    this.orderService.acceptDelivery(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: error => {
        console.error('Failed to accept delivery:', error);
      }
    });
  }

  markOnTheWay(orderId: number): void {
    this.orderService.markOnTheWay(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: error => {
        console.error('Failed to mark order on the way:', error);
      }
    });
  }

  markDelivered(orderId: number): void {
    this.orderService.markDelivered(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: error => {
        console.error('Failed to mark order as delivered:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}