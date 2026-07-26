import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { VerifyOtp } from './auth/verify-otp/verify-otp';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { NotFound } from './not-found/not-found';
import { Dashboard } from './dashboard/dashboard';
import { Departements } from './departements/Admin/departements';
import { Utilisateurs } from './utilisateurs/Admin/utilisateurs';
import { MesDepenses } from './depenses/chef-departement/mes-depenses';



export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'dashboard', component: Dashboard },
  { path: 'departements', component: Departements },
  { path: 'utilisateurs', component: Utilisateurs },
  { path: 'mes-depenses', component: MesDepenses },
  { path: '**', component: NotFound }
];
