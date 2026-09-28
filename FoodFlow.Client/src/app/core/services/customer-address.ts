import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CustomerAddressService {

  private http = inject(HttpClient);

  private apiUrl = 'https://foodflow-api-st1v.onrender.com/api/CustomerAddress';

  getAddresses() {
    return this.http.get<any[]>(this.apiUrl);
  }

  addAddress(address: {
    address: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
  }) {
    return this.http.post(this.apiUrl, address);
  }
}