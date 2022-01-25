import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ServerApiModel} from "./server-api.model";
import {Observable} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";

@Injectable({
  providedIn: "root"
})
export class ServerApi implements ServerApiModel {
  constructor(private httpClient: HttpClient) {

  }

  getServersData(): Observable<{ data: ProxyModel[] }> {

    return this.httpClient.get<{data: ProxyModel[]}>('someUrl')
  }

}
