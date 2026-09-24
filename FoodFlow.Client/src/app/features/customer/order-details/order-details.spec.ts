import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order';
import { OrderSignalrService } from '../../../core/services/order-signalr';

@Component({
  selector: 'app-order-details',
  imports: [RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {

  order = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private orderSignalr: OrderSignalrService
  ) {}

  ngOnInit() {

    const orderId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    // Listen for real-time order status updates
    this.orderSignalr.onOrderStatusUpdated((data) => {

      if (data.orderId !== orderId) {
        return;
      }

      console.log('Order status updated:', data);

      this.order.update(currentOrder => {

        if (!currentOrder) {
          return currentOrder;
        }

        return {
          ...currentOrder,
          status: data.status
        };
      });

    });


    // Load order details
    this.orderService.getOrder(orderId).subscribe({

      next: (data) => {
        this.order.set(data);
      },

      error: (error) => {
        console.error(
          'Failed to load order:',
          error
        );
      }

    });


    // Start SignalR connection
    this.orderSignalr.startConnection()

      .then(() => {

        console.log('SignalR connected');

        return this.orderSignalr.joinOrderGroup(orderId);

      })

      .then(() => {

        console.log(
          `Joined order-${orderId} group`
        );

      })

      .catch(error => {

        console.error(
          'SignalR connection failed:',
          error
        );

      });

  }


  getStatusClass(
    status: string,
    currentStatus: string
  ) {

    const statuses = [
      'Pending',
      'Accepted',
      'Preparing',
      'Ready',
      'Assigned',
      'PickedUp',
      'OnTheWay',
      'Delivered'
    ];

    const currentIndex =
      statuses.indexOf(currentStatus);

    const statusIndex =
      statuses.indexOf(status);

    if (statusIndex < currentIndex) {
      return 'completed';
    }

    if (statusIndex === currentIndex) {
      return 'current';
    }

    return 'upcoming';
  }

}
