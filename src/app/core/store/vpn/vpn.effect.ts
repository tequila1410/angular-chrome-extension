import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  closeConnection,
  closeConnectionSuccess,
  connecting, connectingError,
  connectingSuccess,
  setServers,
  setServersSuccess
} from "./vpn.actions";
import {catchError, exhaustMap, map, mergeMap} from "rxjs/operators";
import {from, of} from "rxjs";
import pacGenerator from "../../utils/pacGenerator";
import {clearProxy, sendMessage, setProxy} from "../../utils/chrome-backgroud";
import {ServerApi} from "../../api/server.api";
import {MockDataApi} from "../../api/mock-data.api";

@Injectable()
export class VpnEffect {

  constructor(private actions$: Actions,
              private api: MockDataApi) {
  }

  $connecting = createEffect(() =>
    this.actions$.pipe(
      ofType(connecting),
      mergeMap(proxy => {
        return from(setProxy(proxy));
      }),
      mergeMap((proxy) => {
        return this.api.testNetwork(proxy);
      }),
      map(proxy => {
        return connectingSuccess(proxy);
      }),
      catchError(error => {
        console.log(error)
        return of(connectingError({message: 'sam sasi error'}))
        // return of();
      })
    )
  )

  $connectionClose = createEffect(() =>
    this.actions$.pipe(
      ofType(closeConnection),
      map(() => {
        clearProxy();
        return closeConnectionSuccess();
      })
    )
  )

  $setServers = createEffect(() =>
    this.actions$.pipe(
      ofType(setServers),
      exhaustMap(() => this.api.getServersData()),
      map(response => {
        return setServersSuccess({serverList: response.data.serverList})
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
