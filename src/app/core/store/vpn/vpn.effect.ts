import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  bestServerSelect, bestServerSelectSuccess,
  closeConnection,
  closeConnectionSuccess,
  connecting, connectingError,
  connectingSuccess, setExclusionsMode, setExclusionsModeSuccess, setRecentlyUsed, setRecentlyUsedSuccess,
  setServers,
  setServersSuccess
} from "./vpn.actions";
import {catchError, exhaustMap, map, mergeMap, take, tap, withLatestFrom} from "rxjs/operators";
import {from, of} from "rxjs";
import pacGenerator from "../../utils/pacGenerator";
import {clearProxy, sendMessage, setProxy} from "../../utils/chrome-backgroud";
import {ServerApi} from "../../api/server.api";
import {MockDataApi} from "../../api/mock-data.api";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { ExclusionDbService } from "../../utils/indexedDB/exclusion-db.service";
import { exclusionsMode } from "./vpn.selector";
import { ExclusionLink } from "../../models/exclusion-link.model";

@Injectable()
export class VpnEffect {
  exclusionsLinks!: ExclusionLink[];

  constructor(private actions$: Actions,
              private store$: Store<AppState>,
              private api: MockDataApi,
              private exclusionDB: ExclusionDbService) {
  }

  $connecting = createEffect(() =>
    this.actions$.pipe(
      ofType(connecting),
      mergeMap(proxy => {
        // this.store$
        //   .select(exclusionsMode)
        //   .pipe(take(1))
        //   .subscribe(exclusionsMode => {
        //     if (exclusionsMode === 'regularMode') {
        //       this.exclusionDB.getRegularLinks().subscribe(links => this.exclusionsLinks = links);
        //     }
        //     if (exclusionsMode === 'selectiveMode') {
        //       this.exclusionDB.getSelectiveLinks().subscribe(links => this.exclusionsLinks = links);
        //     }
        //   });

        return from(setProxy(proxy, this.exclusionsLinks));
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
      withLatestFrom(this.store$),
      map(([response, storeState]) => {
        const selectedServer = storeState.vpn.bestServerSelected ?
          response.data.serverList.reduce((a, b) => (a.ping < b.ping ? a : b))
          :
          response.data.serverList[0];
        return setServersSuccess({serverList: response.data.serverList, selectedServer})
      })
    )
  )

  $bestServerSelect = createEffect(() =>
    this.actions$.pipe(
      ofType(bestServerSelect),
      map((action) => {
        localStorage.setItem('isBestServerSelected', JSON.stringify(action.bestServerSelected));
        return bestServerSelectSuccess({bestServerSelected: action.bestServerSelected})
      })
    )
  )

  $setRecentlyUsed = createEffect(() =>
    this.actions$.pipe(
      ofType(setRecentlyUsed),
      withLatestFrom(this.store$),
      map(([action, stateStore]) => {
        const recentlyUsed = stateStore.vpn.recentlyUsed;
        let newRecentlyUsed = recentlyUsed;

        if (recentlyUsed.length < 5) {
          newRecentlyUsed = [...recentlyUsed, action.recentlyUsedProxy];
        } else {
          newRecentlyUsed.shift();
          newRecentlyUsed.push(action.recentlyUsedProxy);
        }
        localStorage.setItem('recentlyUsed', JSON.stringify(newRecentlyUsed));

        return setRecentlyUsedSuccess({recentlyUsedProxies: newRecentlyUsed});
      })
    )
  )

  $setExclusionsMode = createEffect(() => 
    this.actions$.pipe(
      ofType(setExclusionsMode),
      map((action) => {
        localStorage.setItem('exclusionsMode', action.exclusionsMode)
        return setExclusionsModeSuccess({exclusionsMode: action.exclusionsMode})
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
