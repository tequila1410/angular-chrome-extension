import {ProxyModel} from "../../../auth/models/proxy.model";
import {Action, createReducer, on} from "@ngrx/store";
import {
  closeConnection,
  closeConnectionError,
  closeConnectionSuccess,
  connecting,
  connectingError,
  connectingSuccess, setServers, setServersSuccess
} from "./vpn.actions";

export interface VPNState {
  connected: boolean;
  connecting: boolean;
  selectedServer?: ProxyModel;
  serverList: ProxyModel[];
  error?: string;
}

const initialState: VPNState = {
  connected: false,
  connecting: false,
  serverList: []
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
  })
)

export function vpnReducer(state: VPNState | undefined, action: Action) {
  return _vpnReducer(state, action);
}
