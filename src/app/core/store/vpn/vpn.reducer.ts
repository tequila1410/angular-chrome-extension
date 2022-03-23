import {ProxyModel} from "../../../auth/models/proxy.model";
import {Action, createReducer, on} from "@ngrx/store";
import {
  closeConnection,
  closeConnectionError,
  closeConnectionSuccess,
  connecting,
  connectingError,
  connectingSuccess, setRecentlyUsed, setServers, setServersSuccess
} from "./vpn.actions";

export interface VPNState {
  connected: boolean;
  connecting: boolean;
  selectedServer?: ProxyModel;
  serverList: ProxyModel[];
  recentlyUsed: ProxyModel[];
  error?: string;
}

const initialState: VPNState = {
  connected: false,
  connecting: false,
  serverList: [],
  recentlyUsed: []
}

const _vpnReducer = createReducer(
  initialState,
  on(connecting, (state) => state = {...state, connecting: true}),
  on(connectingSuccess, (state, proxyData) => state = {...state, connecting: false, connected: true, selectedServer: proxyData}),
  on(connectingError, (state, error) => state = {...state, connecting: false, connected: false, error: error.message}),
  on(closeConnection, (state,) => state = {...state, connecting: true}),
  on(closeConnectionSuccess, (state,) => state = {...state, connecting: false, connected: false}),
  on(closeConnectionError, (state,) => state = {...state, connecting: false}),
  on(setServers, state => state = {...state}),
  on(setServersSuccess, (state, data) => state = {
    ...state,
    serverList: data.serverList,
    selectedServer: data.serverList[0]
  }),
  on(setRecentlyUsed, (state, proxyData) => {
    if (state.recentlyUsed.length < 5) {
      state = {
        ...state,
        recentlyUsed: [...state.recentlyUsed, proxyData]
      }
    }
    else {
      state.recentlyUsed.shift();
      state.recentlyUsed.push(proxyData);
    }
    renewRecentlyUsed(state.recentlyUsed);
    return state
  })
)

function renewRecentlyUsed(recentlyUsed: ProxyModel[]) {
  localStorage.setItem('recentlyUsed', JSON.stringify(recentlyUsed));
}

export function vpnReducer(state: VPNState | undefined, action: Action) {
  return _vpnReducer(state, action);
}
