import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackendService } from '../../backend.service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaComponent, RecaptchaModule, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from '../../../environments/environment.prod';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  providers: [BackendService, RecaptchaComponent, { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey }],
  imports: [HttpClientModule, RouterLink, FormsModule, CommonModule, RecaptchaV3Module, RecaptchaModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css'
})
export class ForgotComponent {

  cellPhone: String = '';
  token: String = '';

  // Variáveis para controle de loading e mensagens de erro
  loading: boolean = false;
  errorMessage: string | null = null;
  captcha: string = '';
  otp: string = '';
  recaptchaResolved: boolean = false;
  newPassoword: boolean = false;

  // Variáveis para controle de validação de campos
  passwordMismatch: boolean = false;
  passwordLengthInvalid: boolean = false;
  passwordsEmpty: boolean = false;
  password: string = '';
  passwordConfirm: string = '';

  constructor(private backendService: BackendService, private authService: AuthService, private router: Router) { }

  
  // Função chamada ao submeter o formulário
  submitForm() {
    if (!this.recaptchaResolved && !this.newPassoword) {
      this.errorMessage = 'Please complete the reCAPTCHA.';
      return;
    }
    if (!this.newPassoword) {
      this.verifyOtp(); // Função para verificar o OTP
    } else if (this.newPassoword) {
      this.resetPassword();
    }
  }

  verifyOtp() {
    // Cria o corpo da requisição
    const data = {
      cellPhone: this.cellPhone,  // Código OTP inserido pelo usuário
      captchaToken: this.captcha
    };
  
    // Chama o serviço backend para verificar o OTP
  this.authService.verifyOtpReset(data).subscribe({
    next: (response: any) => {
      if (response.status === 200) {
        this.newPassoword = true;
      } else {
        this.errorMessage = 'OTP verification failed. Please try again.';
      }
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

resetPassword(): void {
    this.loading = true; // Ativa o indicador de loading

    const data = {
      cellPhone: this.cellPhone,
      otpCode: this.otp,
      newPassword: this.password
    };

    setTimeout(() => {
      // Chamada ao serviço de backend para registro do usuário
      this.authService.resetPassword(data).subscribe({
        next: response => {
          console.log('Verficação do captcha - sucesso', response);
          this.loading = false; // Desativa o indicador de loading após sucesso
          this.router.navigate(['/login']);
        },
        error: error => {
          console.error('Erro ao registrar usuário', error);
          this.loading = false; // Desativa o indicador de loading em caso de erro
          if (error.status === 400) {
            this.errorMessage = 'Erro ao cadastrar, verifique os dados e tente novamente';
          } else {
            this.errorMessage = 'Erro ao cadastrar, tente novamente mais tarde';
          }
        }
      });
    }, 1000);
  }    

  // Formatação de telefone celular para exibição
  formatCellPhone(): void {
    const cellPhone = this.cellPhone.replace(/\D/g, '');
    this.cellPhone = cellPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Função chamada quando o reCAPTCHA é resolvido
  handleRecaptcha(response: any) : void {
    if (response) {
      this.captcha = response;
      this.recaptchaResolved = true;
    } else {
      this.recaptchaResolved = false;
    }
  }
}
