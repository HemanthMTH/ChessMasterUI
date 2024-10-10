import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ChessMasterApp'; // Set the app title
  isAuthenticated = false; // Track if the user is authenticated

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  // Method to handle logout
  logout() {
    this.authService.logout(); // Clear the auth token
    this.router.navigate(['/login']); // Navigate to login after logout
  }
}
