import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  // Famous game ID to allow unauthenticated access
  private readonly famousGameId = 'FAMOUS_GAME_ID';  // Replace with actual famous game ID

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const gameId = route.params['id'];

    // Check if the requested game is the famous game
    if (gameId === this.famousGameId) {
      return true; // Allow access to famous game without authentication
    }

    // Check if the user is authenticated for all other cases
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirect to login if not authenticated
    this.router.navigate(['/login']);
    return false;
  }
}
