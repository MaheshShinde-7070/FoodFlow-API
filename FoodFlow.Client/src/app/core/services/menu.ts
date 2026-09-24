import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl = 'https://foodflow-api-st1v.onrender.com';

  constructor(private http: HttpClient) {}

  // Get restaurant menu
  getMenu(restaurantId: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/restaurant/${restaurantId}`
    );
  }

  // Add food
  addMenuItem(item: any) {
    return this.http.post(
      this.apiUrl,
      item
    );
  }

  // Update food
  updateMenuItem(id: number, item: any) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      item
    );
  }

  // Delete food
  deleteMenuItem(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  // Make food available/unavailable
  updateAvailability(
    id: number,
    isAvailable: boolean
  ) {
    return this.http.patch(
      `${this.apiUrl}/${id}/availability?isAvailable=${isAvailable}`,
      {}
    );
  }
}