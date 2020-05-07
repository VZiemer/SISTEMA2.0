import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProdutoRoutingModule } from './produto-routing.module';
import { ProdutoComponent } from './produto.component';
import { SharedModule } from '../shared/shared.module';
import { AngularMaterialModule } from '../angular-material.module';
import { MatSelectModule } from '@angular/material/select';
import {MatTreeModule} from '@angular/material/tree';

import {
  MatInputModule, MatPaginatorModule, MatProgressSpinnerModule,
  MatSortModule, MatTableModule
} from '@angular/material';

@NgModule({
  declarations: [ProdutoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ProdutoRoutingModule,
    FormsModule,
    AngularMaterialModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTreeModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: []
})
export class ProdutoModule { }
