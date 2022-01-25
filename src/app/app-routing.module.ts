import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./auth/guards/auth.guard";
import {DashboardComponent} from "./products/dashboard/dashboard.component";

const routes: Routes = [{
  path: 'dashboard',
  component: DashboardComponent,
  // canActivate: [AuthGuard]
}, {
  path: '',
  redirectTo: 'dashboard',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
