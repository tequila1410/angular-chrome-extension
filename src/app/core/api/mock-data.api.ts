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
    const testServers = [
      '217.119.140.251',
    '217.119.140.11',
    '217.119.140.213',
    '217.119.140.60',
    '188.244.121.242',
    '188.244.121.33',
    '188.244.121.114',
    '188.244.121.1',
    '188.244.121.72',
    '188.244.121.5',
    ];
    let result: ProxyModel[] = [];
    testServers.forEach(ip => result.push({
      id: ip,
      locationName: 'United Kingdom',
      scheme: 'http',
      host: ip,
      port: 12323,
      image: '',
      ping: 12
    }))
    return of({
      data: {
        serverList: result,
        tariffName: '1 year global vpn'
      }
    })
  }

}
