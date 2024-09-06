import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import routeConfig from './app/app.routes';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptor } from './app/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Configuração do interceptor HTTP
const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];

// Inicialização da aplicação Angular
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routeConfig),
    provideHttpClient(), // Utilizando o provideHttpClient
    httpInterceptorProviders, provideAnimationsAsync(), provideAnimationsAsync()
  ]
}).catch(err => console.error(err));
