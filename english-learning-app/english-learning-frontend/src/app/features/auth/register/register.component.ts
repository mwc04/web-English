import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  showPassword = false;
  showConfirmPassword = false;
  errorMsg = '';
  loading = false;
  returnUrl = '/profile';

  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  continueWithGoogle() {
    console.log('Continue with Google');
  }

  onRegister() {
    if (!this.registerData.fullName || !this.registerData.email || !this.registerData.password) return;

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMsg = 'Mật khẩu xác nhận không khớp!';
      return;
    }

    if (this.registerData.password.length < 8) {
      this.errorMsg = 'Mật khẩu phải có ít nhất 8 ký tự!';
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    this.authService.register({
      username: this.registerData.email.split('@')[0],
      email: this.registerData.email,
      password: this.registerData.password,
      full_name: this.registerData.fullName
    }).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Đăng ký thất bại';
        this.loading = false;
      }
    });
  }
}
