import { NgModule } from '@angular/core';
import {Route, RouterModule} from "@angular/router";
import {SignInComponent, SignUpComponent} from "./components";

const routes: Route[] = [{
  path: '',
  children: [{
    path: 'sign-in',
    component: SignInComponent
  }, {
    path: 'sign-up',
    component: SignUpComponent
  }, {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  }]
}]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
