import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {DashboardComponent, VpnListComponent} from "./containers";

const routes: Route[] = [{
  path: 'dashboard',
  component: DashboardComponent
}, {
  path: 'vpn-list',
  component: VpnListComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
