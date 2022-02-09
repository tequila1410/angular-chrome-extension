import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {DashboardComponent, VpnListComponent} from "./containers";

const routes: Route[] = [{
  path: '',
  component: DashboardComponent,
  children: [{
    path: 'vpn-list',
    component: VpnListComponent
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
