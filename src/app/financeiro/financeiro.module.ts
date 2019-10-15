import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceiroRoutingModule } from './financeiro-routing.module';

import { FinanceiroComponent } from './financeiro.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [FinanceiroComponent],
  imports: [CommonModule, SharedModule, FinanceiroRoutingModule, FormsModule],
})
export class FinanceiroModule {}
