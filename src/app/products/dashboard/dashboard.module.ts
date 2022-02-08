import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {containers} from "./containers";
import {components} from "./conponents";
import {DashboardRoutingModule} from "./dashboard-routing.module";
import {ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    ...containers,
    ...components
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule
  ]
})
export class DashboardModule { }
