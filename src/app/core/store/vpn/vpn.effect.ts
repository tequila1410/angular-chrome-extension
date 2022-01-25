import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {closeConnection, closeConnectionSuccess, connecting, connectingProcess, connectingSuccess} from "./vpn.actions";
import {map, mergeMap, tap} from "rxjs/operators";
import {ProxyModel} from "../../../auth/models/proxy.model";
import {from, of} from "rxjs";
import pacGenerator from "../../utils/pacGenerator";

@Injectable()
export class VpnEffect {

  constructor(private actions$: Actions) {
  }

  $connecting = createEffect(() =>
    this.actions$.pipe(
      ofType(connecting),
      mergeMap(proxy => {
        return from(this.testPromise(proxy));
      }),
      map(proxy => {
        return connectingSuccess(proxy);
        // return this.testPromise(proxy).then(data => {
        //   console.log('that is okaaay: ', data);
        //   return connectingSuccess(proxy);
        // })
        // return connectingProcess();
      })
    )
  )

  testPromise(proxy: ProxyModel): Promise<ProxyModel> {
    return new Promise((resolve, reject) => {
      let config = {
        mode: "fixed_servers",
        rules: {
          singleProxy: {
            scheme: proxy.scheme,
            host: proxy.host,
            port: proxy.port
          },
          bypassList: ["foobar.com"] // there are list of executed sites could be
        }
      };

      chrome.proxy.settings.set(
        {value: config, scope: 'regular'},
        (details: any) => {
          console.log('details: ', details);
          resolve(proxy);
        }
      );
    })
  }

  $connectionClose = createEffect(() =>
    this.actions$.pipe(
      ofType(closeConnection),
      map(() => {
        chrome.proxy.settings.clear({});
        return closeConnectionSuccess();
      })
    )
  )

  convertToChromeConfig(proxyConfig: any) {
    const {
      bypassList,
      host,
      port,
      inverted,
      defaultExclusions,
      nonRoutableCidrNets,
    } = proxyConfig;

    const proxyAddress = `${host}:${port}`;
    const pacScript = pacGenerator.generate(
      proxyAddress,
      bypassList,
      inverted,
      defaultExclusions,
      nonRoutableCidrNets,
    );

    return {
      value: {
        mode: 'pac_script',
        pacScript: {
          data: pacScript,
        },
      },
      scope: 'regular',
    };
  };

}
