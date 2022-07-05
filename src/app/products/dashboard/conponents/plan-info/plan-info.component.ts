import {Component, Input, OnInit} from '@angular/core';
import {DashboardOverview} from 'src/app/core/models/dashboard-overview.model';
import {SubscriptionData, User} from "../../../../core/models/user.model";

@Component({
  selector: 'app-plan-info',
  templateUrl: './plan-info.component.html',
  styleUrls: ['./plan-info.component.scss']
})
export class PlanInfoComponent implements OnInit {

  /**
   * Current user subscription input data
   * @type {SubscriptionData | undefined}
   */
  @Input() subscriptionData!: SubscriptionData | undefined;

  /**
   * Current user dashboard overview input data
   * @type {DashboardOverview | undefined | null}
   */
  @Input() overviewData!: DashboardOverview | undefined | null;

  /**
   * Current user input data
   * @type {User | undefined}
   */
  @Input() currentUser!: User | undefined;

  /**
   * Variable for link to extend plan
   * @type {string}
   */
  extendPlanLink!: string;

  /**
   * Constructor for PlanInfoComponent
   */
  constructor() { }

  /**
   * Call on component init
   * @return {void}
   */
  ngOnInit(): void {
    this.extendPlanLink = this.currentUser?.email.endsWith('@zoogvpn.com') ?
      'https://zoogvpn.com/pricing/' : 'https://app.zoogvpn.com/plans';
  }

}
