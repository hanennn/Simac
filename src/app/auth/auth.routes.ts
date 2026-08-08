import { Routes } from '@angular/router';
import { Login } from './login/login';
import { VerifyOtp } from './verify-otp/verify-otp';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'verify-otp', component: VerifyOtp },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
];