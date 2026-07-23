import { Routes } from '@angular/router';
import { Login } from './login/login';
import { VerifyOtp } from './verify-otp/verify-otp';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { NotFound } from './not-found/not-found';
import { Dashboard } from './dashboard/dashboard';
import { Departements } from './departements/departements';
import { Utilisateurs } from './utilisateurs/utilisateurs';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'dashboard', component: Dashboard },
  { path: 'departements', component: Departements },
  { path: 'utilisateurs', component: Utilisateurs },
  { path: '**', component: NotFound }
];