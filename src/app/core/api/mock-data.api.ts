import {Injectable} from "@angular/core";
import {ServerApiModel} from "./server-api.model";
import {Observable, of} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";

@Injectable({
  providedIn: "root"
})
export class MockDataApi implements ServerApiModel {
  constructor() {
  }

  getServersData(): Observable<{ data: ProxyModel[] }> {
    return of({
      data: [{
        id: 1,
        locationName: 'Moldova',
        scheme: "http",
        host: "176.116.234.35",
        port: 12323
      }, {
        id: 2,
        locationName: 'test loc',
        scheme: "socks5",
        host: "keywordfox.com",
        port: 1080
      }]
    })
  }

}
