import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CaixaComponent } from './caixa.component';

const routes: Routes = [
  {
    path: 'caixa',
    component: CaixaComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaixaRoutingModule {}
