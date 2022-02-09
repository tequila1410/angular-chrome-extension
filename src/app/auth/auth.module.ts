import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from "ng-recaptcha";
import {ReactiveFormsModule} from "@angular/forms";

import {containers} from "./containers";
import {components} from "./components";
import {AuthRoutingModule} from "./auth-routing.module";

@NgModule({
  declarations: [
    ...containers,
    ...components,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    RecaptchaV3Module
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LeBBAodAAAAAN-ro5COYhQBrsiG1hYEG4G6KTeJ'
    },
  ]
})
export class AuthModule {}
