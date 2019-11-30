import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FinanceiroComponent } from './financeiro.component';

const routes: Routes = [
  {
    path: 'financeiro',
    component: FinanceiroComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceiroRoutingModule {}
