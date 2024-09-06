import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InitialComponent } from './components/initial/initial.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotComponent } from './components/forgot/forgot.component';
import { AdministrationComponent } from './bussines/administration/administration.component';
import { RegisterItemsComponent } from './bussines/administration/register-items/register-items.component';
import { RegisterCategoryComponent } from './bussines/administration/register-category/register-category.component';

const routeConfig: Routes = [
  {
    path: '',
    component: InitialComponent,
    title: 'Home page'
  },
  {
    path: 'initial',
    component: InitialComponent,
    title: 'Initial Page'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login page'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register'
  },
  {
    path: 'forgot',
    component: ForgotComponent,
    title: 'Forgot'
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    title: 'Administration'
  },
  {
    path: 'administration/registerItem', // Adicione esta rota
    component: RegisterItemsComponent,
    title: 'Register Items'
  },
  {
    path: 'administration/registerCategory', // Adicione esta rota
    component: RegisterCategoryComponent,
    title: 'Register Category'
  }
];

export default routeConfig;
