import { Routes } from '@angular/router';
import { Login } from '../login/login';
import { VerifyOtp } from './auth/verify-otp/verify-otp';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { NotFound } from './not-found/not-found';
import { Dashboard } from './dashboard/dashboard';
import { Departements } from './departements/Admin/departements';
import { Utilisateurs } from './utilisateurs/Admin/utilisateurs';
import { MesDepenses } from './depenses/chef-departement/mes-depenses';
import { MonBudget } from './budgets/chef-departement/mon-budget';
import { Budgets } from './budgets/responsable-financier/budgets';
import { CategoriesDepartement } from './departements/Admin/categories-departement';
import { ValidationDepenses } from './depenses/responsable-financier/validation-depenses';
import { CategoriesDepense } from './depenses/responsable-financier/categories-depense';
import { FaireAchat } from './produits/chef-departement/faire-achat';
// ...


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
  { path: 'mon-budget', component: MonBudget },
  { path: 'budgets', component: Budgets },
  { path: 'validation-depenses', component: ValidationDepenses },
  { path: 'categories-departement', component: CategoriesDepartement },
  { path: 'categories-depense', component: CategoriesDepense },
  { path: 'faire-achat', component: FaireAchat },
  { path: '**', component: NotFound }
];