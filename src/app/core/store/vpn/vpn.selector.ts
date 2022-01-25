import {AppState} from "../app.reducer";
import {createSelector} from "@ngrx/store";
import {VPNState} from "./vpn.reducer";

export const selectVPN = (state: AppState) => state.vpn;

export const isVPNConnected = createSelector(
  selectVPN,
  (state: VPNState) => state.connected
)
