import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceiroComponent } from './tabela.component';

import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';

// NECESSARIOS PARA O SELECT E FORM CONTROL
import { MatSelectModule } from '@angular/material/select';
import {MatInputModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FinanceiroComponent],
  imports: [CommonModule, MatSortModule,
    MatSelectModule, MatInputModule, FinanceiroComponent, FormsModule,
    MatTableModule, MatCheckboxModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TabelaModule { }
