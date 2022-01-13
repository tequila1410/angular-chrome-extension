import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from "./auth/containers";
import {SignInComponent} from "./auth/components";
import {DashboardComponent} from "./products/dashboard/dashboard.component";

const routes: Routes = [{
  path: 'auth',
  component: AuthComponent,
  children: [{
    path: 'sign-in',
    component: SignInComponent
  }, {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  }]
}, {
  path: 'dashboard',
  component: DashboardComponent
},];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
