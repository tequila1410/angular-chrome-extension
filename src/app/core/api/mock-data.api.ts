import {Injectable} from "@angular/core";
import {ServerApiModel} from "./server-api.model";
import {Observable, of} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";
import {HttpClient} from "@angular/common/http";
import {catchError, delay, map} from "rxjs/operators";
import { User } from "../models/user.model";

@Injectable({
  providedIn: "root"
})
export class MockDataApi implements ServerApiModel {
  constructor(private httpClient: HttpClient) {
  }

  getServersData(): Observable<{data: {serverList: ProxyModel[], tariffName: string}}> {
    const testServers = [
      '45.90.249.65',
      '45.90.251.10',
      '188.244.121.188',
      '188.244.121.236',
      '188.244.121.89',
      '23.106.58.10'
    ];

    const testServers2 = [{
      ip: '95.168.176.100',
      locationName: 'UK - London 3',
      domain: "uk2.zoogvpn.com",
      port: 3128
    }, {
      ip: '23.106.58.10',
      locationName: 'UK - London 4',
      domain: "uk3.zoogvpn.com",
      port: 3128
    }, {
      ip: '81.17.62.28',
      locationName: 'UK - London Free',
      domain: "uk.free.zoogvpn.com",
      port: 3128
    }, {
      ip: '193.187.1.190',
      locationName: 'UK - London 5',
      domain: "uk5.zoogvpn.com",
      port: 3128
    }]
    let result: ProxyModel[] = [];
    testServers2.forEach((server, index) => result.push({
      id: server.ip,
      locationName: server.locationName,
      scheme: 'http',
      host: server.domain,
      port: server.port,
      image: '',
      ping: Math.floor(Math.random() * 150),
      isAllowedStream: true,
      isAllowedP2P: true,
    }))
    return of({
      data: {
        serverList: result,
        tariffName: '1 year global vpn'
      }
    }).pipe(delay(1000))
  }

  testNetwork(proxy: any) {
    return this.httpClient.get('https://api-d.zoogvpn.com/', {
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

  getTestUserData(fingerprint: string, token: string): Observable<{data: {token: string, user: User}}> {
    //Test user: setrarorto@vusra.com / password: setrarorto@vusra.com
    return of({
      data: {
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGV2LWFwaS56b29ndnBuLmNvbVwvYXBpXC91c2Vyc1wvbG9naW4iLCJpYXQiOjE2NTIzMDc0NjIsImV4cCI6MTY1MjMxMTA2MiwibmJmIjoxNjUyMzA3NDYyLCJqdGkiOiJHYTl2SnFZcDJpQ1ZVU2tvIiwic3ViIjo1NDYwNTgsInBydiI6ImNlMDUzZmY5M2M5OGUxNzk3NWNiM2Y4ZDAwMDEyMWI2OGFiOGExZTcifQ.AHk0Zcc9xv1WV6e8RZbMPY0RGXCS5u6SwCFjweg_BFE",
        user: {
          accountStatus: "Expired",
          id: 546270,
          firstName : "Setrarorto@vusra.com",
          secondName: '',
          email: "setrarorto@vusra.com",
          verified: 1,
          subscriptionData: {
            tariffId: 1,
            tariffName: "Free Plan",
            tariffKey: "free-plan",
            expiresDate: "2022-03-31 23:59:59",
            isRecurring: false,
            subscriptionStatus: 1
          }
        }
      }
    }).pipe(delay(3000));
  }

}
