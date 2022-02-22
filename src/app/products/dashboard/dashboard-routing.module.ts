import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {DashboardComponent, SettingsComponent, VpnListComponent} from "./containers";

const routes: Route[] = [{
  path: '',
  component: DashboardComponent,
}, {
  path: 'vpn-list',
  component: VpnListComponent
}, {
  path: 'settings',
  component: SettingsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
