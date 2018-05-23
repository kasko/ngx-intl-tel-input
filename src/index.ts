import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxIntlTelInputComponent } from './ngx-intl-tel-input.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
export * from './ngx-intl-tel-input.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule.forRoot()
  ],
  declarations: [
    NgxIntlTelInputComponent
  ],
  exports: [
    NgxIntlTelInputComponent
  ]
})
export class NgxIntlTelInputModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxIntlTelInputModule,
    };
  }
}
