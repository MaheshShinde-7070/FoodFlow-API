import { Component } from '@angular/core';
import { CartService } from '../../../core/services/cart';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  constructor(public cartService: CartService) {}

 getTotal() {
  return this.cartService.cartItems()
    .reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
}

increaseQuantity(itemId: number) {
  this.cartService.increaseQuantity(itemId);
}

decreaseQuantity(itemId: number) {
  this.cartService.decreaseQuantity(itemId);
}
}