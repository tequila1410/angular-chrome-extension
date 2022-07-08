import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ServerApiModel} from "./server-api.model";
import {Observable} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ServerApi implements ServerApiModel {

  /**
   * Constructor for ServerApi
   * @param {HttpClient} httpClient 
   */
  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get servers data
   * @return {Observable<{data: {serverList: ProxyModel[], tariffName: string}}>}
   */
  getServersData(): Observable<{data: {serverList: ProxyModel[], tariffName: string}}> {

    return this.httpClient.get<{
      data: {
        serverList: {
          domain: string,
          locationName: string,
          locationCode: string,
          image: string,
          ping: number,
          isAvailableHttpProxy: boolean,
          isAllowedStream: boolean,
          isAllowedP2P: boolean,
          ipv4: string
        }[],
        tariffName: string
      }
    }>('zoog_api/api/server/locations/overview')
      .pipe(
        map(response => {
          const newServers: ProxyModel[] = [];
          const serverList = response.data.serverList;
          for (let i = 0; i < serverList.length; i++) {
            if (response.data.serverList[i].isAvailableHttpProxy)
              newServers.push({
                host: serverList[i].domain,
                id: serverList[i].ipv4,
                locationName: serverList[i].locationName,
                locationCode: serverList[i].locationCode,
                image: serverList[i].image,
                port: 3128,
                scheme: 'http',
                ping: serverList[i].ping,
                isAllowedStream: serverList[i].isAllowedStream,
                isAllowedP2P: serverList[i].isAllowedP2P
              })
          }
          return {
            data: {
              serverList: newServers,
              tariffName: response.data.tariffName
            }
          }
        })
      )
  }

  /**
   * Test network request for connecting to proxy
   * @param {any} proxy 
   * @return {Observable<any>}
   */
  testNetwork(proxy: any): Observable<any> {
    return this.httpClient.get('https://api.ipify.org?format=json', )
      .pipe(
        map((response) => {
          console.log('ipify: ', response);
          return proxy;
        }),
        catchError(error => {
          console.log('VPN connect error: ', error);
          return proxy;
        })
      )
  }

}
