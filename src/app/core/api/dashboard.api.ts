import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DashboardOverview} from "../models/dashboard-overview.model";

@Injectable()
export class DashboardApi {

  constructor(private httpClient: HttpClient) {

  }

  /**
   * Get dashboard overview data
   * @return {Observable<DashboardOverview>}
   */
  getOverViewData(): Observable<{ data: DashboardOverview }> {
    return this.httpClient.get<{ data: DashboardOverview }>(`zoog_api/api/dashboard/overview`);
  }

}
