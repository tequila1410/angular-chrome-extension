import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {DashboardComponent} from "../../../products/dashboard/dashboard.component";

const routes: Route[] = [{
  path: '/dashboard',
  component: DashboardComponent
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule {}
