import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

const routes: Routes = [
  {
    path: 'financeiro',
    loadChildren: () => import('./financeiro/financeiro.module')
      .then(m => m.FinanceiroModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module')
      .then(m => m.HomeModule),
  },
  {
    path: '',
    redirectTo: 'financeiro',
    pathMatch: 'full'
  },
  {
    path: 'caixa',
    loadChildren: () => import('./caixa/caixa.module')
      .then(m => m.CaixaModule),
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
