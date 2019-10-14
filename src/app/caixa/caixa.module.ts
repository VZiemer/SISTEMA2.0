import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CaixaRoutingModule } from './caixa-routing.module';
import { CaixaComponent } from './caixa.component';
import { SharedModule } from '../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from '../angular-material.module';
import { MyModalComponent } from './my-modal/my-modal.component';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
@NgModule({
  declarations: [CaixaComponent, MyModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    CaixaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatCheckboxModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [MyModalComponent]
})
export class CaixaModule { }
