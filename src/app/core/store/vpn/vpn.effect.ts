import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
  bestServerSelect, bestServerSelectSuccess,
  closeConnection, closeConnectionSuccess,
  connecting, connectingSuccess, connectingError,
  setRecentlyUsed, setRecentlyUsedSuccess,
  setServers, setServersSuccess,
  setExclusionsMode, setExclusionsModeSuccess,
  setRegularExclusionsSuccess, setSelectiveExclusionsSuccess,
  setSelectiveExclusions, setRegularExclusions,
  addRegularExclusion, addRegularExclusionSuccess,
  addSelectiveExclusion, addSelectiveExclusionSuccess,
  deleteRegularExclusion, deleteSelectiveExclusion,
  deleteRegularExclusionSuccess, deleteSelectiveExclusionSuccess,
  clearChosenExclusions, clearRegularExclusions, clearSelectedExclusions,
  changeRegularExclusion, changeSelectiveExclusion,
  changeRegularExclusionSuccess, changeSelectiveExclusionSuccess,
} from "./vpn.actions";
import {catchError, exhaustMap, map, mergeMap, switchMap, withLatestFrom} from "rxjs/operators";
import {from} from "rxjs";
import {
  checkListener, clearBudge,
  clearProxy, getProxyObservable, handlerBehaviorChanged,
  removeOnAuthRequiredHandler,
  setBadge,
  setIcon,
  setProxy
} from "../../utils/chrome-backgroud";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import { ExclusionDbService } from "../../utils/indexedDB/exclusion-db.service";
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

  $changeRegularExclusion = createEffect(() =>
    this.actions$.pipe(
      ofType(changeRegularExclusion),
      switchMap(exclusion => this.exclusionDB.changeLink('regularMode', exclusion.regularExclusion)),
      map(() => changeRegularExclusionSuccess())
    )
  )

  $changeSelectiveExclusion = createEffect(() =>
    this.actions$.pipe(
      ofType(changeSelectiveExclusion),
      switchMap(exclusion => this.exclusionDB.changeLink('selectiveMode', exclusion.selectiveExclusion)),
      map(() => changeSelectiveExclusionSuccess())
    )
  )

  $connecting = createEffect(() =>
    this.actions$.pipe(
      ofType(connecting),
      withLatestFrom(this.store$),
      mergeMap(([proxy, storeState]) => {
        if (storeState.vpn.connected) {
          clearProxy();
        }
        let exclusions: string[] = [];
        let inverted: boolean = false;
        if (storeState.vpn.exclusionsMode === 'regularMode') {
          inverted = false;
          storeState.vpn.regularExclusions.find(ex => {
            if (ex.enabled) {
              exclusions.push(ex.link)
            }
          })
        }
        if (storeState.vpn.exclusionsMode === 'selectiveMode') {
          inverted = true;
          storeState.vpn.selectiveExclusions.find(ex => {
            if (ex.enabled) {
              exclusions.push(ex.link)
            }
          })
        }
        console.log('effect set proxy')
        return from(setProxy(proxy, exclusions, inverted));
      }),
      mergeMap((proxy) => {
        return this.api.testNetwork(proxy);
      }),
      map(proxy => {
        setIcon();
        setBadge(proxy.locationCode);
        return connectingSuccess(proxy);
      }),
      catchError((error, caught) => {
        connectingError({message: 'connection error'});
        return caught;
      })
    )
  )

  $connectionClose = createEffect(() =>
    this.actions$.pipe(
      ofType(closeConnection),
      map(() => {
        clearProxy();
        clearBudge();
        checkListener();
        removeOnAuthRequiredHandler();
        handlerBehaviorChanged();
        checkListener();
        return closeConnectionSuccess();
      })
    )
  )

  $setServers = createEffect(() => {
    let proxyHost: string;
      return this.actions$.pipe(
        ofType(setServers),
        switchMap(() => getProxyObservable()),
        exhaustMap((proxy) => {
          proxyHost = proxy?.host;
          return this.api.getServersData()
        }),
        withLatestFrom(this.store$),
        switchMap(([response, storeState]) => {
          console.log('proxyHost: ', proxyHost);
          const server = response.data.serverList.find(r => r.host === proxyHost);
          if (server) {
            connectingSuccess(server);
            return [setServersSuccess({
              serverList: response.data.serverList,
              selectedServer: server
            }), connectingSuccess(server)];
          }
          const selectedServer = storeState.vpn.bestServerSelected ?
            response.data.serverList
              .filter(a => a.host !== 'locked' && a.ping > 0)
              .reduce((a, b) => (a.ping < b.ping ? a : b))
            :
            response.data.serverList.filter(a => a.host !== 'locked' && a.ping > 0)[0];

          return [setServersSuccess({serverList: response.data.serverList, selectedServer})]
        })
      )
    }
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

        newRecentlyUsed = newRecentlyUsed.filter((proxy, index, self) => index === self.findIndex((el) => el.id === proxy.id))

        localStorage.setItem('recentlyUsed', JSON.stringify(newRecentlyUsed));

        return setRecentlyUsedSuccess({recentlyUsedProxies: newRecentlyUsed});
      })
    )
  )

}
