import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    // Adiciona o código do país ao número de telefone
    data.cellPhone = "+55" + data.cellPhone
    return this.http.post<any>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(response => this.setAuthToken(response.token))
    );
  }

  register(data: any): Observable<any> {
    // Adiciona o código do país ao número de telefone
    data.user.cellPhone = "+55" + data.user.cellPhone.replace(/\D/g, '');
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data);
  }

  reset(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgot-password`, data);
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  verifyOtp(body: any) {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/auth/verify-otp`, body, { headers });
  }

  verifyOtpReset(body: any): Observable<HttpResponse<any>> {
    body.cellPhone = "+55" + body.cellPhone;
    return this.http.post<any>(`${this.apiUrl}/auth/reset-verify-otp`, body, { observe: 'response' }).pipe(
      catchError(error => {
        console.error('Erro ao verificar OTP para reset:', error);
        throw error;
      })
    );
  }

  resetPassword(body: any): Observable<HttpResponse<any>> {
    body.cellPhone = '+55' + body.cellPhone;
    return this.http.post<any>(`${this.apiUrl}/auth/reset-new-password`, body, { observe: 'response' }).pipe(
      catchError(error => {
        console.error('Erro ao resetar senha:', error);
        throw error;
      })
    );
  }
}
