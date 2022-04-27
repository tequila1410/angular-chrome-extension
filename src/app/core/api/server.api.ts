import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ServerApiModel} from "./server-api.model";
import {Observable} from "rxjs";
import {ProxyModel} from "../../auth/models/proxy.model";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ServerApi implements ServerApiModel {
  constructor(private httpClient: HttpClient) {

  }

  getServersData(): Observable<{data: {serverList: ProxyModel[], tariffName: string}}> {

    return this.httpClient.get<{data: {serverList: {ipv4: string, locationName: string, image: string, ping: number}[], tariffName: string}}>('zoog_api/api/server/locations/overview')
      .pipe(
        map(response => {
          const newServers: ProxyModel[] = response.data.serverList.map(item => {
            return {
              host: item.ipv4,
              id: item.ipv4,
              locationName: item.locationName,
              image: item.image,
              port: 80,
              scheme: 'http',
              ping: item.ping
            }
          });
          return {
            data: {
              serverList: newServers,
              tariffName: response.data.tariffName
            }
          }
        })
      )
  }

}
