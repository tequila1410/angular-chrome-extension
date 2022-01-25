import {createAction, props} from "@ngrx/store";
import {ProxyModel} from "../../../auth/models/proxy.model";

export const connecting = createAction(
  '[VPN Connecting]',
  props<ProxyModel>()
)

export const connectingSuccess = createAction(
  '[VPN Connecting success]',
  props<ProxyModel>()
)

export const connectingError = createAction(
  '[VPN Connecting success]',
  props<{ message: string }>()
)

export const connectingProcess = createAction(
  '[VPN Connection process]'
)

export const closeConnection = createAction(
  '[VPN Connection close]'
)

export const closeConnectionSuccess = createAction(
  '[VPN Connection close success]'
)

export const closeConnectionError = createAction(
  '[VPN Connection close error]'
)
