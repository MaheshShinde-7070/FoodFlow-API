import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-delivery-register',
  imports: [FormsModule],
  templateUrl: './delivery-register.html',
  styleUrl: './delivery-register.css'
})
export class DeliveryRegisterComponent {

  name = '';
  email = '';
  password = '';
  vehicleType = '';
  vehicleNumber = '';

  constructor(private authService: AuthService) {}

  register() {
    this.authService.registerDeliveryPartner(
      this.name,
      this.email,
      this.password,
      this.vehicleType,
      this.vehicleNumber
    ).subscribe({
      next: response => {
        console.log('Registration successful:', response);
        alert('Delivery partner registered successfully!');
      },
      error: error => {
        console.error('Registration failed:', error);
        alert(error.error?.message || 'Registration failed.');
      }
    });
  }
}