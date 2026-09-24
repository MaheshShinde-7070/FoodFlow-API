import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../../core/services/restaurant';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  restaurants = signal<any[]>([]);

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {

    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants.set(data);
        console.log(data);
      },
      error: (error) => {
        console.error(error);
      }
    });

  }
}