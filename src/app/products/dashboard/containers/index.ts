import {DashboardComponent} from "./dashboard/dashboard.component";
import {SettingsComponent} from "./settings/settings.component";
import {VpnListComponent} from "./vpn-list/vpn-list.component";

export const containers = [
  DashboardComponent,
  VpnListComponent,
  SettingsComponent
];

export * from "./dashboard/dashboard.component";
export * from "./vpn-list/vpn-list.component";
export * from "./settings/settings.component";
