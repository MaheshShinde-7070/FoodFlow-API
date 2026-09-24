import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems = signal<any[]>([]);
  restaurantId = signal<number | null>(null);

  addToCart(item: any) {

    // Store restaurant ID
    if (this.restaurantId() === null) {
      this.restaurantId.set(item.restaurantId);
    }

    this.cartItems.update(items => {

      const existingItem = items.find(x => x.id === item.id);

      if (existingItem) {
        return items.map(x =>
          x.id === item.id
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }

      return [
        ...items,
        {
          ...item,
          quantity: 1
        }
      ];
    });
  }

  getCart() {
    return this.cartItems();
  }

  clearCart() {
    this.cartItems.set([]);
    this.restaurantId.set(null);
  }

  removeFromCart(itemId: number) {
    this.cartItems.update(items =>
      items.filter(item => item.id !== itemId)
    );
  }

  increaseQuantity(itemId: number) {
    this.cartItems.update(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  decreaseQuantity(itemId: number) {
    this.cartItems.update(items =>
      items
        .map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }
}