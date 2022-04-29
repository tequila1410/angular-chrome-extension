import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./auth/guards/auth.guard";
import {OnlyGuestGuard} from "./auth/guards/only-guest.guard";

const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  // canLoad: [OnlyGuestGuard],
  // canActivate: [OnlyGuestGuard]
}, {
  path: 'dashboard',
  loadChildren: () => import('./products/dashboard/dashboard.module').then(m => m.DashboardModule),
  // canLoad: [AuthGuard],
  // canActivate: [AuthGuard]
}, {
  path: '',
  loadChildren: () => import('./core/user-auth-handler/user-auth-handler.module').then(m => m.AuthUserHandlerModule),
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
