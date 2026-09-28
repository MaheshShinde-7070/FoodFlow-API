import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';
import { CustomerAddressService } from '../../../core/services/customer-address';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-checkout',
  imports: [FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  private addressService = inject(CustomerAddressService);
  showAddressForm = false;
  newAddress = '';
newAddressLatitude = 0;
newAddressLongitude = 0;
newAddressIsDefault = false;
  addresses = signal<any[]>([]);
  selectedAddressId = signal<number | null>(null);

  constructor(
    public cartService: CartService,
    public router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }


  useCurrentLocation(): void {
  if (!navigator.geolocation) {
    alert('Location is not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {

      this.newAddressLatitude = position.coords.latitude;
      this.newAddressLongitude = position.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${this.newAddressLatitude}&lon=${this.newAddressLongitude}&addressdetails=1`
        );

        if (!response.ok) {
          throw new Error('Failed to get address.');
        }

        const data = await response.json();

        this.newAddress = data.display_name || '';

        alert('Location detected successfully.');

      } catch (error) {

        console.error('Reverse geocoding error:', error);

        alert(
          'Location detected, but address could not be found. Please enter it manually.'
        );
      }
    },

    (error) => {

      console.error('Location error:', error);

      alert(
        'Unable to get your location. Please allow location access.'
      );
    }
  );
}
saveNewAddress(): void {

  if (!this.newAddress.trim()) {
    alert('Please enter an address.');
    return;
  }

  const address = {
    address: this.newAddress,
    latitude: this.newAddressLatitude,
    longitude: this.newAddressLongitude,
    isDefault: this.newAddressIsDefault
  };

  this.addressService.addAddress(address).subscribe({
    next: () => {

      alert('Address saved successfully.');

      this.newAddress = '';
      this.newAddressLatitude = 0;
      this.newAddressLongitude = 0;
      this.newAddressIsDefault = false;
      this.showAddressForm = false;

      this.loadAddresses();
    },

    error: (error) => {
      console.error('Failed to save address:', error);
      alert(error.error?.message || 'Failed to save address.');
    }
  });
}

  loadAddresses(): void {

    this.addressService.getAddresses().subscribe({
      next: (data) => {

        this.addresses.set(data);

        const defaultAddress = data.find(
          (address: any) => address.isDefault
        );

        if (defaultAddress) {
          this.selectedAddressId.set(defaultAddress.id);
        }
      },

      error: (error) => {
        console.error('Failed to load addresses:', error);
      }
    });
  }

  getTotal() {
    return this.cartService.cartItems()
      .reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
  }

  placeOrder() {

    const restaurantId = this.cartService.restaurantId();

    if (!restaurantId) {
      alert('Restaurant information is missing.');
      return;
    }

    const selectedAddress = this.addresses().find(
      address => address.id === this.selectedAddressId()
    );

    if (!selectedAddress) {
      alert('Please select a delivery address.');
      return;
    }

    const order = {
      restaurantId: restaurantId,
      deliveryAddress: selectedAddress.address,
      items: this.cartService.cartItems().map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(order).subscribe({
      next: (response) => {

        console.log('Order placed:', response);

        alert('Order placed successfully!');

        this.cartService.clearCart();

        this.router.navigate(['/home']);
      },

      error: (error) => {
        console.error('Order failed:', error);
        alert(error.error?.message || 'Failed to place order.');
      }
    });
  }
}