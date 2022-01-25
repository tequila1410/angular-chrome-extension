import {Observable} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";

export interface ServerApiModel {
  getServersData(): Observable<{data: ProxyModel[]}>
}
