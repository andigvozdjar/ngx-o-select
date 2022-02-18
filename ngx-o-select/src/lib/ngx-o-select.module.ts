import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SelectLocalization } from '../lib/models/shared.models';
import { OSelectComponent } from './components/o-select/o-select.component';



const components = [
  OSelectComponent
]


@NgModule({
  declarations: [
    components
  ],
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatButtonModule
  ],
  exports: [
    components
  ],
  providers: [
    {
      provide: SelectLocalization, useValue: new SelectLocalization()
    }
  ]
})

export class NgxOSelectModule {}