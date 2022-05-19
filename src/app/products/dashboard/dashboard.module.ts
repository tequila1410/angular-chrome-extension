import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {containers} from "./containers";
import {components} from "./conponents";
import {DashboardRoutingModule} from "./dashboard-routing.module";
import {ReactiveFormsModule} from "@angular/forms";
import { BytesPipe } from 'src/app/core/pipes/bites.pipe';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {RequestInterceptorService} from "../../core/services/app.interceptor";
import {PassPopupComponent} from 'src/app/core/components/pass-popup/pass-popup.component';



@NgModule({
  declarations: [
    ...containers,
    ...components,
    BytesPipe,
    PassPopupComponent
  ],
  exports: [
    BytesPipe
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptorService,
      multi: true
    }
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule
  ]
})
export class DashboardModule { }
