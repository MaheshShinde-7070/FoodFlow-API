import { Component, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order';
import { OrderSignalrService } from '../../../core/services/order-signalr';
import { RestaurantService } from '../../../core/services/restaurant';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [FormsModule,RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  orders = signal<any[]>([]);

  restaurantId = 0;

  restaurant = signal<any>(null);

  deliveryPartners = signal<any[]>([]);

  selectedPartnerId: number | null = null;

  constructor(
    private orderService: OrderService,
    private orderSignalr: OrderSignalrService,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {

    this.restaurantId = this.getRestaurantIdFromToken();

    console.log('Dashboard Restaurant ID:', this.restaurantId);

    if (this.restaurantId === 0) {
      console.error('Restaurant ID not found in token.');
      return;
    }

    this.loadRestaurant();
    this.loadOrders();
    this.loadAvailableDeliveryPartners();

    this.orderSignalr.onNewOrderReceived((data) => {
      console.log('New order received:', data);

      this.loadOrders();

      alert(`New Order Received! Order #${data.orderId}`);
    });

    this.orderSignalr.onOrderStatusUpdated((data) => {

      console.log(
        'Restaurant order status updated:',
        data
      );

      this.orders.update(currentOrders =>
        currentOrders.map(order =>
          order.id === data.orderId
            ? {
                ...order,
                status: data.status
              }
            : order
        )
      );
    });

    this.orderSignalr.startConnection()
      .then(() => {

        console.log(
          'Restaurant SignalR connected'
        );

        return this.orderSignalr
          .joinRestaurantGroup(
            this.restaurantId
          );
      })
      .then(() => {

        console.log(
          'Joined restaurant group'
        );

      })
      .catch(error => {

        console.error(
          'Restaurant SignalR connection failed:',
          error
        );

      });
  }


  // ==============================
  // Restaurant
  // ==============================

  getRestaurantIdFromToken(): number {

    const token = localStorage.getItem('token');

    if (!token) {
      return 0;
    }

    try {

      const payload =
        JSON.parse(
          atob(token.split('.')[1])
        );

      return Number(
        payload['RestaurantId']
      ) || 0;

    } catch (error) {

      console.error(
        'Invalid token:',
        error
      );

      return 0;
    }
  }


  loadRestaurant(): void {

    this.restaurantService
      .getRestaurant(this.restaurantId)
      .subscribe({

        next: data => {

          this.restaurant.set(data);

          console.log(
            'Restaurant:',
            data
          );

        },

        error: error => {

          console.error(
            'Failed to load restaurant:',
            error
          );

        }

      });
  }


  // ==============================
  // Orders
  // ==============================

  loadOrders(): void {

    this.orderService
      .getRestaurantOrders(
        this.restaurantId
      )
      .subscribe({

        next: data => {

          this.orders.set(data);

          console.log(
            'Restaurant Orders:',
            data
          );

        },

        error: error => {

          console.error(
            'Failed to load orders:',
            error
          );

        }

      });
  }


  // ==============================
  // Dashboard Statistics
  // ==============================

  getTotalOrders(): number {

    return this.orders().length;

  }


  getAssignedOrders(): number {

    return this.orders()
      .filter(
        order =>
          order.status === 'Assigned'
      )
      .length;

  }


  getDeliveredOrders(): number {

    return this.orders()
      .filter(
        order =>
          order.status === 'Delivered'
      )
      .length;

  }


  getRejectedOrders(): number {

    return this.orders()
      .filter(
        order =>
          order.status === 'Rejected'
      )
      .length;

  }


  getTodaysCollection(): number {

    const today =
      new Date();

    return this.orders()
      .filter(order => {

        if (
          order.status !== 'Delivered' ||
          !order.createdAt
        ) {
          return false;
        }

        const orderDate =
          new Date(order.createdAt);

        return (
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        );

      })
      .reduce(
        (total, order) =>
          total +
          Number(order.totalAmount || 0),
        0
      );

  }


  // ==============================
  // Restaurant Order Actions
  // ==============================

  acceptOrder(orderId: number): void {

    this.orderService
      .acceptOrder(orderId)
      .subscribe({

        next: () =>
          this.loadOrders(),

        error: error =>
          console.error(
            'Accept order failed:',
            error
          )

      });
  }


  rejectOrder(orderId: number): void {

    this.orderService
      .rejectOrder(orderId)
      .subscribe({

        next: () =>
          this.loadOrders(),

        error: error =>
          console.error(
            'Reject order failed:',
            error
          )

      });
  }


  markPreparing(orderId: number): void {

    this.orderService
      .markPreparing(orderId)
      .subscribe({

        next: () =>
          this.loadOrders(),

        error: error =>
          console.error(
            'Start preparing failed:',
            error
          )

      });
  }


  markReady(orderId: number): void {

    this.orderService
      .markReady(orderId)
      .subscribe({

        next: () =>
          this.loadOrders(),

        error: error =>
          console.error(
            'Mark ready failed:',
            error
          )

      });
  }


  // ==============================
  // Delivery Partners
  // ==============================

  loadAvailableDeliveryPartners(): void {

    this.orderService
      .getAvailableDeliveryPartners()
      .subscribe({

        next: data =>
          this.deliveryPartners.set(data),

        error: error =>
          console.error(
            'Failed to load delivery partners:',
            error
          )

      });
  }


  assignDeliveryPartner(
    orderId: number
  ): void {

    if (
      this.selectedPartnerId === null
    ) {

      alert(
        'Please select a delivery partner.'
      );

      return;
    }

    this.orderService
      .assignDeliveryPartner(
        orderId,
        this.selectedPartnerId
      )
      .subscribe({

        next: () => {

          alert(
            'Delivery partner assigned successfully.'
          );

          this.loadOrders();

          this.loadAvailableDeliveryPartners();

          this.selectedPartnerId = null;

        },

        error: error => {

          console.error(
            'Assignment failed:',
            error
          );

          alert(
            'Failed to assign delivery partner.'
          );

        }

      });
  }
}
