import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-restaurant-card',
  imports: [RouterLink],
  templateUrl: './restaurant-card.html',
  styleUrl: './restaurant-card.css'
})
export class RestaurantCard {
  @Input() restaurant: any;
}