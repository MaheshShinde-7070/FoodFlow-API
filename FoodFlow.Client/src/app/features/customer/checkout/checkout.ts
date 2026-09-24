import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';

@Component({
  selector: 'app-checkout',
  imports: [],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {

  constructor(
    public cartService: CartService,
    private router: Router,
     private orderService: OrderService
  ) {}

  getTotal() {
    return this.cartService.cartItems()
      .reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
  }

  placeOrder() {

  const restaurantId = this.cartService.restaurantId();

  if (!restaurantId) {
    alert('Restaurant information is missing.');
    return;
  }

  const order = {
    restaurantId: restaurantId,
    deliveryAddress: 'Pune, Maharashtra',
    items: this.cartService.cartItems().map(item => ({
      menuItemId: item.id,
      quantity: item.quantity
    }))
  };

  this.orderService.createOrder(order).subscribe({
    next: (response) => {
      console.log('Order placed:', response);

      alert('Order placed successfully!');

      this.cartService.clearCart();

      this.router.navigate(['/home']);
    },

    error: (error) => {
      console.error('Order failed:', error);
      alert(error.error?.message || 'Failed to place order.');
    }
  });
}
}