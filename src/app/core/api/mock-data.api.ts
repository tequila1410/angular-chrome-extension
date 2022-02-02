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

  getServersData(): Observable<{data: {serverList: ProxyModel[], tariffName: string}}> {
    return of({
      data: {
        serverList: [{
          id: '1',
          locationName: 'Moldova',
          scheme: "http",
          host: "176.116.234.35",
          port: 12323,
          image: ''
        }, {
          id: "2",
          locationName: 'test loc',
          scheme: "socks5",
          host: "keywordfox.com",
          port: 1080,
          image: ''
        }],
        tariffName: '1 year global vpn'
      }
    })
  }

}
