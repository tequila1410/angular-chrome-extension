import {Component, Input, OnInit} from '@angular/core';
import { DashboardOverview } from 'src/app/core/models/dashboard-overview.model';
import {SubscriptionData} from "../../../../core/models/user.model";

@Component({
  selector: 'app-plan-info',
  templateUrl: './plan-info.component.html',
  styleUrls: ['./plan-info.component.scss']
})
export class PlanInfoComponent implements OnInit {

  @Input() subscriptionData!: SubscriptionData | undefined;

  @Input() overviewData!: DashboardOverview | undefined | null;

  constructor() { }

  ngOnInit(): void {
  }

}
