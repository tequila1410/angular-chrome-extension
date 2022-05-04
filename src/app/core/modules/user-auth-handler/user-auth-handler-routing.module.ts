import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import { AuthUserHandlerComponent } from "./user-auth-handler.component";

const routes: Route[] = [{
  path: '',
  component: AuthUserHandlerComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthUserHandlerRoutingModule {}