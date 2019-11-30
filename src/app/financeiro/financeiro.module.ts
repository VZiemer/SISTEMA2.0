import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FinanceiroRoutingModule } from './financeiro-routing.module';
import { FinanceiroComponent } from './financeiro.component';
import { SharedModule } from '../shared/shared.module';
import { AngularMaterialModule } from '../angular-material.module';
import { ModalRegistroDeusComponent } from './modal-registroDeus/modal-registroDeus.component';
import { ModalInsereDataComponent } from './modal-insereData/modal-insereData.component';
import { MatSelectModule } from '@angular/material/select';
import {
  MatInputModule, MatPaginatorModule, MatProgressSpinnerModule,
  MatSortModule, MatTableModule
} from '@angular/material';

@NgModule({
  declarations: [FinanceiroComponent, ModalRegistroDeusComponent, ModalInsereDataComponent],
  imports: [
    CommonModule,
    SharedModule,
    FinanceiroRoutingModule,
    FormsModule,
    AngularMaterialModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [ModalRegistroDeusComponent, ModalInsereDataComponent]
})
export class FinanceiroModule { }
