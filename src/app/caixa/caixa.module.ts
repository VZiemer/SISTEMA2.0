import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaixaRoutingModule } from './caixa-routing.module';

import { CaixaComponent } from './caixa.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CaixaComponent],
  imports: [CommonModule, SharedModule, CaixaRoutingModule]
})
export class CaixaModule {}
