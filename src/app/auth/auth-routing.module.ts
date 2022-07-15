import {NgModule} from '@angular/core';
import {Route, RouterModule} from "@angular/router";
import {SignInComponent} from "./components";

const routes: Route[] = [{
  path: '',
  children: [{
    path: 'sign-in',
    component: SignInComponent
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
