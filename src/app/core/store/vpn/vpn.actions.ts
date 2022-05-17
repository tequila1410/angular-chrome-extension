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
  '[VPN Connecting error]',
  props<{ message: string }>()
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

export const setServers = createAction(
  '[VPN set list of servers]'
)

export const setServersSuccess = createAction(
  '[VPN set list of servers success]',
  props<{serverList: ProxyModel[], selectedServer: ProxyModel | undefined}>()
)

export const setSelectedServer = createAction(
  '[VPN set selected server]',
  props<{selectedServer: ProxyModel | undefined}>()
)

export const setRecentlyUsed = createAction(
  '[VPN set recently used server]',
  props<{recentlyUsedProxy: ProxyModel}>()
)

export const setRecentlyUsedSuccess = createAction(
  '[VPN set recently used server success]',
  props<{recentlyUsedProxies: ProxyModel[]}>()
)

export const bestServerSelect = createAction(
  '[VPN auto finding best server]',
  props<{bestServerSelected: boolean}>()
)

export const bestServerSelectSuccess = createAction(
  '[VPN auto finding best server success]',
  props<{bestServerSelected: boolean}>()
)
