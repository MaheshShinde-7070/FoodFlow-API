import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
