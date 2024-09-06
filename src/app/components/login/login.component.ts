import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BackendService } from '../../backend.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { environment } from '../../../environments/environment.prod';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  standalone: true,
  providers: [BackendService, ReCaptchaV3Service, RecaptchaComponent, AuthService, { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey }],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, RouterLink, FormsModule, RecaptchaModule, HttpClientModule, RecaptchaV3Module]
})

export class LoginComponent {
  cellPhone: string = '';
  password: string = '';
  rememberMe: boolean = false;
  captcha: string = '';
  activeUser: boolean = true;
  errorMessage: string = '';
  otp: string = '';
  recaptchaResolved: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  submitForm(): void {
    if (!this.recaptchaResolved) {
      this.errorMessage = 'Please complete the reCAPTCHA.';
      return;
    }
    if (this.activeUser) {
      this.login();
    } else if (!this.activeUser) {
      this.verifyOtp()
    }
  }

  login(): void {
    const data = {
      cellPhone: this.cellPhone,
      password: this.password,
      captchaToken: this.captcha
    };

    this.authService.login(data).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        const token = response.token;
        this.authService.setAuthToken(token);
        this.activeUser = true;
        if (this.rememberMe) {
          localStorage.setItem('cellPhone', this.cellPhone);
          localStorage.setItem('password', this.password);
        }
      },
      error: (error: any) => {
        console.error('Login failed:', error);

        // Verificar o status de erro
        if (error.status === 403) {
          const token = error.error.token; // Acessando o token do erro
          this.authService.setAuthToken(token);
          this.activeUser = false;
          alert('User is inactive. Please contact support.');
        } else {
          alert('Login failed. Please check your credentials.');
        }
      }
    });
  }

  verifyOtp() {
    // Obtém o token do localStorage
    const token = this.authService.getToken();
    // Cria o corpo da requisição
    const body = {
      "otpCode": this.otp,  // Código OTP inserido pelo usuário
      "token": token
    };

    // Chama o serviço backend para verificar o OTP
    this.authService.verifyOtp(body).subscribe({
      next: response => {
          this.router.navigate(['/login']);
      },
      error: error => {
        console.log('Erro na verificação OTP:', error);
        this.errorMessage = 'An error occurred during OTP verification.';
      },
      complete: () => {
        console.log('Verificação OTP completa.');
      }
    });
  }

  // Função chamada quando o reCAPTCHA é resolvido
  handleRecaptcha(response: any): void {
    if (response) {
      this.captcha = response;
      this.recaptchaResolved = true;
    } else {
      this.recaptchaResolved = false;
    }
  }

}
