import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MenuService } from '../../../core/services/menu';
import { CartService } from '../../../core/services/cart';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {

  menuItems = signal<any[]>([]);

  restaurantId = 0;

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    public cartService: CartService
  ) {}

  ngOnInit(): void {

    this.restaurantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.menuService.getMenu(this.restaurantId).subscribe({
      next: (data) => {

        this.menuItems.set(data);

        console.log('Menu items:', data);

      },

      error: (error) => {

        console.error('Failed to load menu:', error);

      }
    });
  }

  addToCart(item: any): void {

    this.cartService.addToCart(item);

    console.log('Added to cart:', item);

  }

  removeFromCart(itemId: number): void {

    this.cartService.removeFromCart(itemId);

    console.log('Removed from cart:', itemId);

  }

  isAdded(itemId: number): boolean {

    return this.cartService
      .cartItems()
      .some(item => item.id === itemId);

  }
}