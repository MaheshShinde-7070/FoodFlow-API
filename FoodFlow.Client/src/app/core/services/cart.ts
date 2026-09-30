import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems = signal<any[]>([]);

  restaurantId = signal<number | null>(null);

  addToCart(item: any): void {

    const alreadyAdded = this.cartItems()
      .some(cartItem => cartItem.id === item.id);

    if (alreadyAdded) {
      return;
    }

    // Store restaurant ID when first item is added
    if (this.restaurantId() === null && item.restaurantId) {
      this.restaurantId.set(item.restaurantId);
    }

    this.cartItems.update(items => [
      ...items,
      {
        ...item,
        quantity: 1
      }
    ]);
  }

  removeFromCart(itemId: number): void {

    this.cartItems.update(items =>
      items.filter(item => item.id !== itemId)
    );

    // Clear restaurant ID when cart becomes empty
    if (this.cartItems().length === 0) {
      this.restaurantId.set(null);
    }
  }

  increaseQuantity(itemId: number): void {

    this.cartItems.update(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    );
  }

  decreaseQuantity(itemId: number): void {

    this.cartItems.update(items =>
      items
        .map(item =>
          item.id === itemId
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter(item => item.quantity > 0)
    );

    // Clear restaurant ID when cart becomes empty
    if (this.cartItems().length === 0) {
      this.restaurantId.set(null);
    }
  }

  getCart(): any[] {
    return this.cartItems();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.restaurantId.set(null);
  }
}