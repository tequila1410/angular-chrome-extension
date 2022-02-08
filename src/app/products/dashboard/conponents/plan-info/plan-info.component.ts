import {Component, Input, OnInit} from '@angular/core';
import {SubscriptionData} from "../../../../core/models/user.model";

@Component({
  selector: 'app-plan-info',
  templateUrl: './plan-info.component.html',
  styleUrls: ['./plan-info.component.scss']
})
export class PlanInfoComponent implements OnInit {

  @Input() subscriptionData!: SubscriptionData | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
