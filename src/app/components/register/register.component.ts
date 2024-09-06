import { Component } from '@angular/core';
import { BackendService } from '../../backend.service';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaComponent, RecaptchaModule, RecaptchaV3Module} from 'ng-recaptcha';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [BackendService, RecaptchaComponent, { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey }],
  imports: [HttpClientModule, RouterLink, FormsModule, CommonModule, RecaptchaV3Module, RecaptchaModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  
  body = {
    username: '123213213',
    password: '123123123',
    passwordConfirm: '123123123',
    acceptTerms: true,
    cpf: '000.000.000-14',
    cellPhone: '55981183583',
    street: 'Adasad',
    number: '10',
    city: 'asdssad',
    postalCode: '96990000',
    state: 'rs',
    neighborhood: 'centr',
    complement: 'adsdsaads'
  }

  // Variáveis para controle de etapas do registro e validações
  firstRegister: boolean = true;
  secondRegister: boolean = false;
  thirdRegister: boolean = false;

  // Variáveis para controle de validação de campos
  invalidCpf: boolean = false;
  passwordMismatch: boolean = false;
  passwordLengthInvalid: boolean = false;
  passwordsEmpty: boolean = false;

  // Variáveis para controle de loading e mensagens de erro
  loading: boolean = false;
  errorMessage: string | null = null;
  captcha: string = '';
  otp: string = '';
  recaptchaResolved: boolean = false;

  constructor(private backendService: BackendService, private authService: AuthService, private router: Router) { }

  // Função chamada ao submeter o formulário
  submitForm() {
    if (!this.recaptchaResolved && this.firstRegister) {
      this.errorMessage = 'Please complete the reCAPTCHA.';
      return;
    }

    if (this.thirdRegister) {
      this.verifyOtp(); // Função para verificar o OTP
    } else if (this.secondRegister && !this.firstRegister && !this.thirdRegister) {
      if (this.validateSecondRegister()) {
        this.register();
      }
    } else if (this.firstRegister && !this.secondRegister && !this.thirdRegister) {
      if (this.validateFirstRegister()) {
        //Fazer uma chamada para verificar se o telefone já está cadastrado no banco.
        this.secondRegister = true;
        this.firstRegister = false;
      }
    }
  }
  
  verifyOtp() {
    // Obtém o token do localStorage
    const token = this.authService.getToken();
    // Cria o corpo da requisição
    const body = {
      "otpCode": this.otp  // Código OTP inserido pelo usuário
    };
  
    // Chama o serviço backend para verificar o OTP
  this.authService.verifyOtp(body).subscribe({
    next: response => {
      console.log('Verificação OTP ok:', response);
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

  // Função de registro do usuário
  register(): void {
    this.loading = true; // Ativa o indicador de loading
  
    const data = {
      "user": {
        name: this.body.username,
        password: this.body.password,
        acceptTerms: this.body.acceptTerms,
        cpf: this.body.cpf.replace(/\D/g, ''), // Remove tudo que não é dígito
        cellPhone: this.body.cellPhone.replace(/\D/g, ''), // Remove tudo que não é dígito
      },
      "address": {
        street: this.body.street,
        number: this.body.number,
        city: this.body.city,
        state: this.body.state,
        neighborhood: this.body.neighborhood,
        postalCode: '96990000',
        complement: this.body.complement
      },
      "captchaToken": this.captcha
    };
  
    setTimeout(() => {
      // Chamada ao serviço de backend para registro do usuário
      this.authService.register(data).subscribe({
        next: response => {
          console.log('Usuário registrado com sucesso', response);
          if (response.token) {
            this.authService.setAuthToken(response.token); // Salva o token no localStorage
          }
          this.loading = false; // Desativa o indicador de loading após sucesso
          this.secondRegister = false;
          this.thirdRegister = true;
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

  // Retorna o texto do botão de submit com base na etapa atual
  getSubmitButtonText(): string {
    if (this.firstRegister && !this.secondRegister && !this.thirdRegister) {
      return 'Next';
    } else if (this.secondRegister && !this.firstRegister && !this.thirdRegister) {
      return 'Next';
    } else if (this.thirdRegister && !this.firstRegister && !this.secondRegister) {
      return 'Next';
    } else if (!this.thirdRegister && !this.firstRegister && !this.secondRegister) {
      return 'Sing Up';
    }
    return 'Submit';
  }

  // Validação da primeira etapa do registro
  validateFirstRegister(): boolean {
    if (!this.body.username || !this.body.password || !this.body.passwordConfirm || !this.body.acceptTerms || !this.body.cellPhone) {
      this.errorMessage = 'All field are necessary ';
      return false;
    }
    const passwordErrors = this.validatePassword();
    if (passwordErrors.length > 0) {
      this.errorMessage = passwordErrors.join(', ');
      return false;
    }
    this.errorMessage = null;
    return true;
  }

  // Validação da segunda etapa do registro
  validateSecondRegister(): boolean {
    if (this.invalidCpf) {
      this.errorMessage = 'O campo CPF não foi preenchido corretamente';
      return false;
    }
    // Verifica se o número de telefone tem exatamente 11 dígitos, incluindo o '9'
    const cellPhoneDigits = this.body.cellPhone.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cellPhoneDigits.length !== 11 || cellPhoneDigits.charAt(2) !== '9') {
      this.errorMessage = 'Número de celular deve conter 11 dígitos, incluindo o "9".';
      return false;
    }
    this.errorMessage = null;
    return true;
  }

  // Validação da terceira etapa do registro
  validateThirdRegister(): boolean {
    if (!this.body.street || !this.body.number || !this.body.city || !this.body.state || !this.body.neighborhood) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    this.errorMessage = null;
    return true;
  }

  // Validação de senha
  validatePassword(): string[] {
    const errors: string[] = [];
    if (this.body.password !== this.body.passwordConfirm) {
      errors.push('Passwords do not match');
      this.passwordMismatch = true;
    }
    if (this.body.password.length < 8 || this.body.password.length > 12) {
      errors.push('Password must be between 8 and 12 characters long');
      this.passwordLengthInvalid = true;
    }
    if (!this.body.password || !this.body.passwordConfirm) {
      errors.push('Password and Confirm Password cannot be empty');
      this.passwordsEmpty = true;
    }
    return errors;
  }

  // Formatação de CPF para exibição
  formatCpf(): void {
    const cpf = this.body.cpf.replace(/\D/g, '');
    this.body.cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formatação de telefone celular para exibição
  formatCellPhone(): void {
    const cellPhone = this.body.cellPhone.replace(/\D/g, '');
    this.body.cellPhone = cellPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  validateCpf(): void {
    const cpf = this.body.cpf.replace(/\D/g, '');
    let sum = 0;
    let remainder;

    if (cpf.length !== 11 ||
      cpf === "00000000000" ||
      cpf === "11111111111" ||
      cpf === "22222222222" ||
      cpf === "33333333333" ||
      cpf === "44444444444" ||
      cpf === "55555555555" ||
      cpf === "66666666666" ||
      cpf === "77777777777" ||
      cpf === "88888888888" ||
      cpf === "99999999999") {
      this.invalidCpf = true;
      return;
    }

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) {
      this.invalidCpf = true;
      return;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) {
      this.invalidCpf = true;
      return;
    }

    this.invalidCpf = false;
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