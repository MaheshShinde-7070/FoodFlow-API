import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = 'https://localhost:7172/api/Restaurant';

  constructor(private http: HttpClient) {}

  getRestaurants() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRestaurant(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }
}
