import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HotkeyModule} from 'angular2-hotkeys';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
// import { MaterialModalComponent } from './components/material-modal/material-modal.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [CommonModule, TranslateModule, HotkeyModule],
  exports: [TranslateModule, WebviewDirective, HotkeyModule]
})
export class SharedModule {}
