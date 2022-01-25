import {ProxyModel} from "../../../auth/models/proxy.model";
import {Action, createReducer, on} from "@ngrx/store";
import {
  closeConnection,
  closeConnectionError,
  closeConnectionSuccess,
  connecting,
  connectingError,
  connectingSuccess
} from "./vpn.actions";

export interface VPNState {
  connected: boolean;
  connecting: boolean;
  selectedServer?: ProxyModel;
  error?: string;
}

const initialState: VPNState = {
  connected: false,
  connecting: false,
}

const _vpnReducer = createReducer(
  initialState,
  on(connecting, (state) => state = {...state, connecting: true}),
  on(connectingSuccess, (state, proxyData: ProxyModel) => state = {...state, connecting: false, connected: true, selectedServer: proxyData}),
  on(connectingError, (state, error: {message: string}) => state = {...state, connecting: false, error: error.message}),
  on(closeConnection, (state, ) => state = {...state, connecting: true}),
  on(closeConnectionSuccess, (state, ) => state = {...state, connecting: false, connected: false, selectedServer: undefined}),
  on(closeConnectionError, (state, ) => state = {...state, connecting: false}),
)

export function vpnReducer(state: VPNState | undefined, action: Action) {
  return _vpnReducer(state, action);
}
