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
      '188.244.121.89'
    ];
    let result: ProxyModel[] = [];
    testServers.forEach((ip, index) => result.push({
      id: ip,
      locationName: 'United Kingdom',
      scheme: 'http',
      host: ip,
      port: 12323,
      image: '',
      ping: Math.floor(Math.random() * 150)
    }))
    return of({
      data: {
        serverList: result,
        tariffName: '1 year global vpn'
      }
    }).pipe(delay(1000))
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

  getTestUserData(fingerprint: string, token: string): Observable<{data: {token: string, user: User}}> {
    //Test user: setrarorto@vusra.com / password: setrarorto@vusra.com
    return of({
      data: {
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGV2LWFwaS56b29ndnBuLmNvbVwvYXBpXC91c2Vyc1wvbG9naW4iLCJpYXQiOjE2NTE2Nzk5MzcsImV4cCI6MTY1MTY4MzUzNywibmJmIjoxNjUxNjc5OTM3LCJqdGkiOiJKYnhIdXBtcGxDcHc1UzlaIiwic3ViIjo1NDYwNTgsInBydiI6ImNlMDUzZmY5M2M5OGUxNzk3NWNiM2Y4ZDAwMDEyMWI2OGFiOGExZTcifQ.zrB3yJxiNkWPjXrdh8uG431Ve0wDls3IYi6dPPewsT0",
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
