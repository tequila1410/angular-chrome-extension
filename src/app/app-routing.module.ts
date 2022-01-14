import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from "./auth/containers";
import {AppLayoutComponent} from "./core/layouts/app-layout/app-layout.component";
import {AuthGuard} from "./auth/guards/auth.guard";

const routes: Routes = [{
  path: 'auth',
  component: AuthComponent
}, {
  path: 'app',
  component: AppLayoutComponent,
  canActivate: [AuthGuard]
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
