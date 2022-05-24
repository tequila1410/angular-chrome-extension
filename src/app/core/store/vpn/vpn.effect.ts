import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  bestServerSelect, bestServerSelectSuccess,
  closeConnection,
  closeConnectionSuccess,
  connecting, connectingError,
  connectingSuccess,
  setRecentlyUsed, setRecentlyUsedSuccess,
  setServers,
  setServersSuccess,
  setExclusionsMode, setExclusionsModeSuccess,
  setRegularExclusionsSuccess, setSelectiveExclusionsSuccess,
  setSelectiveExclusions, setRegularExclusions,
  addRegularExclusion, addRegularExclusionSuccess,
  addSelectiveExclusion, addSelectiveExclusionSuccess,
  deleteRegularExclusion, deleteSelectiveExclusion,
  deleteRegularExclusionSuccess, deleteSelectiveExclusionSuccess,
  clearChosenExclusions, clearRegularExclusions, clearSelectedExclusions
} from "./vpn.actions";
import {catchError, exhaustMap, map, mergeMap, switchMap, timeout, withLatestFrom} from "rxjs/operators";
import {from, of} from "rxjs";
import pacGenerator from "../../utils/pacGenerator";
import {clearProxy, sendMessage, setIcon, setProxy} from "../../utils/chrome-backgroud";
import {MockDataApi} from "../../api/mock-data.api";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { ExclusionDbService } from "../../utils/indexedDB/exclusion-db.service";
import { ExclusionLink } from "../../models/exclusion-link.model";
import {ServerApi} from "../../api/server.api";

@Injectable()
export class VpnEffect {

  constructor(private actions$: Actions,
              private store$: Store<AppState>,
              private api: ServerApi,
              private exclusionDB: ExclusionDbService) {
  }
  $setExclusionsMode = createEffect(() =>
    this.actions$.pipe(
      ofType(setExclusionsMode),
      map((action) => {
        localStorage.setItem('exclusionsMode', action.exclusionsMode)
        return setExclusionsModeSuccess({exclusionsMode: action.exclusionsMode})
      })
    )
  )

  $setRegularExclusions = createEffect(() =>
    this.actions$.pipe(
      ofType(setRegularExclusions),
      exhaustMap(() => this.exclusionDB.getRegularLinks()),
      map(regularExclusions => {
        this.store$.dispatch(setSelectiveExclusions());
        return setRegularExclusionsSuccess({regularExclusions})
      })
    )
  )

  $setSelectiveExclusions = createEffect(() =>
    this.actions$.pipe(
      ofType(setSelectiveExclusions),
      exhaustMap(() => this.exclusionDB.getSelectiveLinks()),
      map(selectiveExclusions => {
        return setSelectiveExclusionsSuccess({selectiveExclusions})
      })
    )
  )

  $addRegularExclusion = createEffect(() =>
    this.actions$.pipe(
      ofType(addRegularExclusion),
      switchMap(exclusion => this.exclusionDB.addLink('regularMode', exclusion.regularExclusion)),
      map(() => addRegularExclusionSuccess())
    )
  )

  $addSelectiveExclusion = createEffect(() =>
    this.actions$.pipe(
      ofType(addSelectiveExclusion),
      switchMap(exclusion => this.exclusionDB.addLink('selectiveMode', exclusion.selectiveExclusion)),
      map(() => addSelectiveExclusionSuccess())
    )
  )

  $deleteRegularExclusion = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteRegularExclusion),
      switchMap(link => this.exclusionDB.removeLink('regularMode', link.linkName)),
      map(() => deleteRegularExclusionSuccess())
    ))

  $deleteSelectiveExclusion = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteSelectiveExclusion),
      switchMap(link => this.exclusionDB.removeLink('selectiveMode', link.linkName)),
      map(() => deleteSelectiveExclusionSuccess())
    ))

  $clearChosenExclusions = createEffect(() =>
    this.actions$.pipe(
      ofType(clearChosenExclusions),
      switchMap(mode => this.exclusionDB.removeDB(mode.chosenMode)),
      map((mode) => mode === 'regularMode' ? clearRegularExclusions() : clearSelectedExclusions())
    ))

  $connecting = createEffect(() =>
    this.actions$.pipe(
      ofType(connecting),
      withLatestFrom(this.store$),
      mergeMap(([proxy, storeState]) => {
        if (storeState.vpn.connected)
          clearProxy();
        // let exclusions: ExclusionLink[] = [];
        // if (storeState.vpn.exclusionsMode === 'regularMode') {
        //   exclusions = storeState.vpn.regularExclusions;
        // }
        // if (storeState.vpn.exclusionsMode === 'selectiveMode') {
        //   exclusions = storeState.vpn.selectiveExclusions;
        // }
        console.log('effect set proxy')
        return from(setProxy(proxy, []));
      }),
      mergeMap((proxy) => {
        return this.api.testNetwork(proxy);
      }),
      map(proxy => {
        setIcon();
        return connectingSuccess(proxy);
      }),
      catchError(error => {
        console.log(error)
        return of(connectingError({message: 'connection error'}))
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
          response.data.serverList
            .filter(a => a.host !== 'locked')
            .reduce((a, b) => (a.ping < b.ping ? a : b))
          :
          response.data.serverList.find(a => a.host !== 'locked');
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
