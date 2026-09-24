import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

login() {

  // Validate empty fields
  if (!this.email.trim() || !this.password.trim()) {
    alert('Please enter email and password.');
    return;
  }

  this.authService.login(this.email, this.password).subscribe({
    next: (response: any) => {

      console.log('LOGIN RESPONSE:', response);

      localStorage.setItem('token', response.token);

      const role = response.user.role;

      this.authService.setRole(role);

      if (role === 'Admin') {
        this.router.navigate(['/admin/orders']);
      }
      else if (role === 'DeliveryPartner') {
        this.router.navigate(['/delivery/dashboard']);
      }
      else if (role === 'Customer') {
        this.router.navigate(['/home']);
      }
      else {
        console.error('Unknown user role:', role);
        alert('Unknown user role.');
      }
    },

    error: error => {

      console.error('Login failed:', error);

      alert(
        error.error?.message ||
        'Invalid email or password'
      );

    }
  });
}

}
