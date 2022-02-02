import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {containers} from "./containers";
import {components} from "./conponents";
import {DashboardRoutingModule} from "./dashboard-routing.module";



@NgModule({
  declarations: [
    ...containers,
    ...components
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
