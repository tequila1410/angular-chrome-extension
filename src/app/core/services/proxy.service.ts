import {Injectable} from "@angular/core";
import {ProxyModel} from "../../auth/models/proxy.model";

@Injectable({
  providedIn: "root"
})
export class ProxyService {

  constructor() {
  }

  // connectToProxy(proxy: ProxyModel, callBackFn: Function) {
  //   const config = {
  //     mode: "fixed_servers",
  //     rules: {
  //       singleProxy: {
  //         scheme: proxy.scheme,
  //         host: proxy.host,
  //         port: proxy.port
  //       },
  //       bypassList: ["foobar.com"] // there are list of executed sites could be
  //     }
  //   };
  //
  //   chrome.proxy.settings.set(
  //     {value: config, scope: 'regular'},
  //     callBackFn
  //   );
  //
  // }

}
