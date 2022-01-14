import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {containers} from "./containers";
import {components} from "./components";
import {ReactiveFormsModule} from "@angular/forms";
import {AuthRoutingModule} from "./auth-routing.module";
import { SignInComponent } from './containers/sign-in/sign-in.component';

@NgModule({
  declarations: [
    ...containers,
    ...components,
    SignInComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ],
})
export class AuthModule {}
