import {createAction, props} from "@ngrx/store";
import {ProxyModel} from "../../../auth/models/proxy.model";
import { ExclusionLink } from "../../models/exclusion-link.model";

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

export const connectingRetry = createAction(
  '[VPN Connecting retry]',
  props<ProxyModel>()
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

export const setExclusionsMode = createAction(
  '[VPN exclusions mode set]',
  props<{exclusionsMode: string}>()
)

export const setExclusionsModeSuccess = createAction(
  '[VPN exclusions mode set success]',
  props<{exclusionsMode: string}>()
)

export const setRegularExclusions = createAction(
  '[VPN set regular exclusions]'
)

export const setRegularExclusionsSuccess = createAction(
  '[VPN set regular exclusions success]',
  props<{regularExclusions: ExclusionLink[]}>()
)

export const setSelectiveExclusions = createAction(
  '[VPN set selective exclusions]'
)

export const setSelectiveExclusionsSuccess = createAction(
  '[VPN set selective exclusions success]',
  props<{selectiveExclusions: ExclusionLink[]}>()
)

export const addRegularExclusion = createAction(
  '[VPN add regular exclusion]',
  props<{regularExclusion: ExclusionLink}>()
)

export const addRegularExclusionSuccess = createAction(
  '[VPN add regular exclusion success]'
)

export const addSelectiveExclusion = createAction(
  '[VPN add selective exclusion]',
  props<{selectiveExclusion: ExclusionLink}>()
)

export const addSelectiveExclusionSuccess = createAction(
  '[VPN add selective exclusion success]'
)

export const deleteRegularExclusion = createAction(
  '[VPN remove regular exclusion]',
  props<{linkName: string}>()
)

export const deleteRegularExclusionSuccess = createAction(
  '[VPN delete regular exclusion success]'
)

export const deleteSelectiveExclusion = createAction(
  '[VPN remove selective exclusion]',
  props<{linkName: string}>()
)

export const deleteSelectiveExclusionSuccess = createAction(
  '[VPN delete selective exclusion success]'
)

export const clearChosenExclusions = createAction(
  '[VPN clear chosen exclusions]',
  props<{chosenMode: string}>()
)

export const clearChosenExclusionsSuccess = createAction(
  '[VPN clear chosen exclusions success]'
)

export const clearRegularExclusions = createAction(
  '[VPN clear regular exclusions]'
)

export const clearSelectedExclusions = createAction(
  '[VPN clear selective exclusions]'
)

export const changeRegularExclusion = createAction(
  '[VPN change regular exclusion]',
  props<{regularExclusion: ExclusionLink}>()
)

export const changeRegularExclusionSuccess = createAction(
  '[VPN change regular exclusion success]'
)

export const changeSelectiveExclusion = createAction(
  '[VPN change selective exclusion]',
  props<{selectiveExclusion: ExclusionLink}>()
)

export const changeSelectiveExclusionSuccess = createAction(
  '[VPN change selective exclusion success]'
)
