import { Component, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-my-orders',
  imports: [RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {

  orders = signal<any[]>([]);

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        console.log('My Orders:', data);
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
      }
    });
  }
  cancelOrder(orderId: number) {

  this.orderService.cancelOrder(orderId).subscribe({
    next: () => {

      alert('Order cancelled successfully.');

      // Reload orders
      this.orderService.getMyOrders().subscribe({
        next: (data) => this.orders.set(data)
      });

    },
    error: (error) => {
      console.error('Cancel failed:', error);
      alert(error.error?.message || 'Unable to cancel order.');
    }
  });

}
}