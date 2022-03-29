import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {containers} from "./containers";
import {components} from "./conponents";
import {DashboardRoutingModule} from "./dashboard-routing.module";
import {ReactiveFormsModule} from "@angular/forms";
import { BytesPipe } from 'src/app/core/pipes/bites.pipe';



@NgModule({
  declarations: [
    ...containers,
    ...components,
    BytesPipe
  ],
  exports: [
    BytesPipe
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule
  ]
})
export class DashboardModule { }
