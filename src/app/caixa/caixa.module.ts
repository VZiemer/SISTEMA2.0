import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
    ReactiveFormsModule,
    AngularMaterialModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
