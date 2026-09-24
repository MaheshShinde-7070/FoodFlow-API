import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7172/api/Auth';

  // Current logged-in user's role
  role = signal<string | null>(localStorage.getItem('role'));

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, {
      name,
      email,
      password
    });
  }

  registerDeliveryPartner(
    name: string,
    email: string,
    password: string,
    vehicleType: string,
    vehicleNumber: string
  ) {
    return this.http.post(
      'https://localhost:7172/api/Auth/register-delivery-partner',
      {
        name,
        email,
        password,
        vehicleType,
        vehicleNumber
      }
    );
  }

  setRole(role: string) {
    localStorage.setItem('role', role);
    this.role.set(role);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    this.role.set(null);
  }
}
