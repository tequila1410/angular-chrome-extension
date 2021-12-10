import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {containers} from "./containers";
import {components} from "./components";
import {RouterModule} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    ...containers,
    ...components
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
})
export class AuthModule {}
