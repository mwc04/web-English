import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showPassword = false;
  errorMsg = '';
  loading = false;
  returnUrl = '/profile';

  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/profile';
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  continueWithGoogle() {
    console.log('Continue with Google');
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) return;

    this.errorMsg = '';
    this.loading = true;

    this.authService.login({
      email: this.loginData.email,
      password: this.loginData.password
    }).subscribe({
      next: (res) => {
        if (res.data.username === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Email hoặc mật khẩu không đúng';
        this.loading = false;
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register'], { queryParams: { returnUrl: this.returnUrl } });
  }
}
