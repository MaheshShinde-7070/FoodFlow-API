import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerAddressService } from '../../../core/services/customer-address';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './address.html',
  styleUrl: './address.css'
})
export class Address implements OnInit {

  private addressService = inject(CustomerAddressService);

  addresses = signal<any[]>([]);

  address = '';
  latitude = 0;
  longitude = 0;
  isDefault = false;

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses.set(data);
      },
      error: (error) => {
        console.error('Failed to load addresses:', error);
      }
    });
  }
getCurrentLocation(): void {

  if (!navigator.geolocation) {
    alert('Location is not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {

      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      console.log('Latitude:', this.latitude);
      console.log('Longitude:', this.longitude);

      alert('Location detected successfully.');
    },
    (error) => {

      console.error('Location error:', error);

      alert('Unable to get your location. Please allow location access.');
    }
  );
}
  addAddress(): void {

    const newAddress = {
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      isDefault: this.isDefault
    };

    this.addressService.addAddress(newAddress).subscribe({
      next: () => {

        alert('Address saved successfully.');

        this.address = '';
        this.latitude = 0;
        this.longitude = 0;
        this.isDefault = false;

        this.loadAddresses();
      },
      error: (error) => {
        console.error('Failed to save address:', error);
      }
    });
  }

}