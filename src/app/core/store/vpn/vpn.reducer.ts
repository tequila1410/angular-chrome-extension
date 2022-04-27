import {ProxyModel} from "../../../auth/models/proxy.model";
import {Action, createReducer, on} from "@ngrx/store";
import {
  bestServerSelect, bestServerSelectSuccess,
  closeConnection,
  closeConnectionError,
  closeConnectionSuccess,
  connecting,
  connectingError,
  connectingSuccess,
  setRecentlyUsedSuccess, setSelectedServer,
  setServersSuccess
} from "./vpn.actions";

export interface VPNState {
  connected: boolean;
  connecting: boolean;
  serverList: ProxyModel[];
  recentlyUsed: ProxyModel[];
  bestServerSelected: boolean;
  selectedServer?: ProxyModel;
  error?: string;
}

const initialState: VPNState = {
  connected: false,
  connecting: false,
  serverList: [],
  recentlyUsed: [],
  bestServerSelected: JSON.parse(localStorage.getItem('isBestServerSelected') || 'true')
}

const _vpnReducer = createReducer(
  initialState,
  on(connecting, (state) => ({...state, connecting: true})),
  on(connectingSuccess, (state, proxyData) => ({
    ...state,
    connecting: false,
    connected: true,
    selectedServer: proxyData
  })),
  on(connectingError, (state, error) => ({...state, connecting: false, connected: false, error: error.message})),
  on(closeConnection, (state,) => ({...state, connecting: true})),
  on(closeConnectionSuccess, (state,) => ({...state, connecting: false, connected: false})),
  on(closeConnectionError, (state,) => ({...state, connecting: false})),
  on(setServersSuccess, (state, data) => ({...state, serverList: data.serverList, selectedServer: data.selectedServer})),
  on(setSelectedServer, (state, data) => ({...state, selectedServer: data.selectedServer})),
  on(bestServerSelectSuccess, (state, data) => ({...state, bestServerSelected: data.bestServerSelected})),
  on(setRecentlyUsedSuccess, (state, data) => ({...state, recentlyUsed: data.recentlyUsedProxies}))
)


export function vpnReducer(state: VPNState | undefined, action: Action) {
  return _vpnReducer(state, action);
}
