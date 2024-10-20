import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        // Allow unauthenticated users to access chessboard with famous game
        this.router.navigate(['/game', 'FAMOUS_GAME_ID']);
        return false;
      })
    );
  }
}
