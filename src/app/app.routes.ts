import { Routes } from '@angular/router';
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
import { EstimationIa } from './budgets/responsable-financier/estimation-ia';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

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
  { path: 'estimation-ia', component: EstimationIa },
  { path: '**', component: NotFound }
];