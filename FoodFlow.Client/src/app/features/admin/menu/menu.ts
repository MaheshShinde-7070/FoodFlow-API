import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../core/services/menu';

@Component({
  selector: 'app-menu',
  imports: [FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {

  menuItems = signal<any[]>([]);

  restaurantId = 0;

  showForm = false;
  editingItemId: number | null = null;

  food = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: ''
  };

  constructor(
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.restaurantId = this.getRestaurantIdFromToken();

    if (this.restaurantId === 0) {
      console.error('Restaurant ID not found in token.');
      return;
    }

    this.loadMenu();
  }

  getRestaurantIdFromToken(): number {

    const token = localStorage.getItem('token');

    if (!token) {
      return 0;
    }

    try {
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      return Number(
        payload['RestaurantId']
      ) || 0;

    } catch (error) {
      console.error('Invalid token:', error);
      return 0;
    }
  }

  loadMenu(): void {

    this.menuService
      .getMenu(this.restaurantId)
      .subscribe({

        next: data => {
          this.menuItems.set(data);
          console.log('Restaurant Menu:', data);
        },

        error: error => {
          console.error(
            'Failed to load menu:',
            error
          );
        }

      });
  }

  openAddForm(): void {

    this.editingItemId = null;

    this.food = {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: ''
    };

    this.showForm = true;
  }

  openEditForm(item: any): void {

    this.editingItemId = item.id;

    this.food = {
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      category: item.category
    };

    this.showForm = true;
  }

  closeForm(): void {

    this.showForm = false;
    this.editingItemId = null;
  }

  saveFood(): void {

    if (
      !this.food.name.trim() ||
      !this.food.category.trim() ||
      this.food.price <= 0
    ) {
      alert(
        'Please enter food name, category and valid price.'
      );

      return;
    }

    const data = {
      name: this.food.name,
      description: this.food.description,
      price: this.food.price,
      imageUrl: this.food.imageUrl,
      category: this.food.category,
      restaurantId: this.restaurantId
    };

    // ADD FOOD
    if (this.editingItemId === null) {

      this.menuService
        .addMenuItem(data)
        .subscribe({

          next: () => {

            alert('Food added successfully.');

            this.closeForm();

            this.loadMenu();
          },

          error: error => {

            console.error(
              'Add food failed:',
              error
            );

            alert(
              error.error?.message ||
              'Failed to add food.'
            );
          }

        });

    }

    // UPDATE FOOD
    else {

      this.menuService
        .updateMenuItem(
          this.editingItemId,
          data
        )
        .subscribe({

          next: () => {

            alert(
              'Food updated successfully.'
            );

            this.closeForm();

            this.loadMenu();
          },

          error: error => {

            console.error(
              'Update food failed:',
              error
            );

            alert(
              error.error?.message ||
              'Failed to update food.'
            );
          }

        });
    }
  }

  deleteFood(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this food item?'
    );

    if (!confirmed) {
      return;
    }

    this.menuService
      .deleteMenuItem(id)
      .subscribe({

        next: () => {

          alert(
            'Food deleted successfully.'
          );

          this.loadMenu();
        },

        error: error => {

          console.error(
            'Delete food failed:',
            error
          );

          alert(
            error.error?.message ||
            'Failed to delete food.'
          );
        }

      });
  }

  toggleAvailability(item: any): void {

    const newAvailability =
      !item.isAvailable;

    this.menuService
      .updateAvailability(
        item.id,
        newAvailability
      )
      .subscribe({

        next: () => {

          this.menuItems.update(items =>
            items.map(x =>
              x.id === item.id
                ? {
                    ...x,
                    isAvailable: newAvailability
                  }
                : x
            )
          );

        },

        error: error => {

          console.error(
            'Availability update failed:',
            error
          );

          alert(
            error.error?.message ||
            'Failed to update availability.'
          );
        }

      });
  }
}

