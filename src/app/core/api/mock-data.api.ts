import {Injectable} from "@angular/core";
import {ServerApiModel} from "./server-api.model";
import {Observable, of} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";
import {HttpClient} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MockDataApi implements ServerApiModel {
  constructor(private httpClient: HttpClient) {
  }

  getServersData(): Observable<{data: {serverList: ProxyModel[], tariffName: string}}> {
    const testServers = [
      '188.244.121.242',
    '188.244.121.34',
    '188.244.121.1',
    '188.244.121.0',
    '188.244.121.142',
    '188.244.121.5',
    '188.244.121.33',
    '188.244.121.175',
    '188.244.121.72',
    '188.244.121.114',
    '188.244.121.188',
    '188.244.121.236',
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

  testNetwork(proxy: any) {
    return this.httpClient.get('https://www.google.com/', {
        responseType: 'text'
      })
      .pipe(
        map(() => {
          console.log('VPN connect success');
          return proxy;
        }),
        catchError(error => {
          console.log('VPN connect error: ', error);
          return proxy;
        })
      )
  }

}
