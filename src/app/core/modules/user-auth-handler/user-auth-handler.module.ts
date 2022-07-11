import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthUserHandlerRoutingModule} from './user-auth-handler-routing.module';
import {AuthUserHandlerComponent} from './user-auth-handler.component';
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from "ng-recaptcha";

@NgModule({
  declarations: [
    AuthUserHandlerComponent
  ],
  imports: [
    CommonModule,
    AuthUserHandlerRoutingModule,
    RecaptchaV3Module
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LeBBAodAAAAAN-ro5COYhQBrsiG1hYEG4G6KTeJ'
    },
  ]
})
export class AuthUserHandlerModule { }