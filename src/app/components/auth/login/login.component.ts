import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../../models/login';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData: Login = this.loginForm.value;
      this.authService.login(loginData).subscribe(
        (res: any) => {
          this.authService.saveToken(res.token); // Store the token
          this.router.navigate(['/dashboard']); // Redirect to home
        },
        (err) => {
          alert('Login failed');
        }
      );
    }
  }
}
