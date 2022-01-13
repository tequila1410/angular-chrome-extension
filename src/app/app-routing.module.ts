import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from "./auth/containers";
import {AppLayoutComponent} from "./core/layouts/app-layout/app-layout.component";

const routes: Routes = [{
  path: 'auth',
  component: AuthComponent
}, {
  path: 'app',
  component: AppLayoutComponent
}, {
  path: '',
  redirectTo: 'app',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
