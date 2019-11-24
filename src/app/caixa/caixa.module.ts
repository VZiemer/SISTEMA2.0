import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';


import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material';

import { CaixaRoutingModule } from './caixa-routing.module';
import { CaixaComponent } from './caixa.component';
import { SharedModule } from '../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from '../angular-material.module';
import { MyModalComponent } from './my-modal/my-modal.component';
import { ModalPagtoCartaoComponent } from './modal-pagto-cartao/modal-pagto-cartao.component';
import { ModalPagtoDiComponent } from './modal-pagto-di/modal-pagto-di.component';
import { ModalPagtoBoletoComponent } from './modal-pagto-boleto/modal-pagto-boleto.component';
import { ModalBuscaVendaComponent } from './modal-busca-venda/busca-venda.component';
import { ModalNfeComponent } from './modal-nfe/modal-nfe.component';


import { ModalBuscaGenericoComponent } from '../shared/components/modal-busca-generico/busca-generico.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatTabsModule} from '@angular/material/tabs';
@NgModule({
  declarations: [
    CaixaComponent,
    MyModalComponent,
    ModalBuscaGenericoComponent,
    ModalPagtoCartaoComponent,
    ModalPagtoDiComponent,
    ModalPagtoBoletoComponent,
    ModalBuscaVendaComponent,
    ModalNfeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CaixaRoutingModule,
    FormsModule,
    MatIconModule,
    MatSelectModule,
    MatMomentDateModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {strict: true}},
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
  ],
  entryComponents: [
    MyModalComponent,
    ModalBuscaVendaComponent,
    ModalBuscaGenericoComponent,
    ModalPagtoCartaoComponent,
    ModalPagtoDiComponent,
    ModalPagtoBoletoComponent,
    ModalNfeComponent
  ]
})
export class CaixaModule {}
