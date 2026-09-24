import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  register(): void {

    // Validate empty fields
    if (!this.name.trim() || !this.email.trim() || !this.password.trim()) {
      alert('Please fill all fields.');
      return;
    }

    this.authService.register(
      this.name,
      this.email,
      this.password
    ).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        alert('Registration successful.');
      },
      error: (error) => {
        console.error('Registration failed:', error);

        alert(
          error.error?.message ||
          'Registration failed. Please try again.'
        );
      }
    });
  }
}
