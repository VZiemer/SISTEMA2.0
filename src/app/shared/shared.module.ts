import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HotkeyModule } from "angular2-hotkeys";

import { TranslateModule } from "@ngx-translate/core";

import { PageNotFoundComponent } from "./components/";
import { WebviewDirective } from "./directives/";

import { ModalBuscaGenericoComponent } from "../shared/components/modal-busca-generico/busca-generico.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTabsModule } from "@angular/material/tabs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AngularMaterialModule } from "../angular-material.module";
import { MatDatepickerModule } from "@angular/material/datepicker";

// import { MaterialModalComponent } from './components/material-modal/material-modal.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    ModalBuscaGenericoComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    HotkeyModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatTabsModule,
    MatDatepickerModule,
    BrowserAnimationsModule,
    AngularMaterialModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    HotkeyModule,
    ModalBuscaGenericoComponent
  ],
  entryComponents: [ModalBuscaGenericoComponent]
})
export class SharedModule {}
