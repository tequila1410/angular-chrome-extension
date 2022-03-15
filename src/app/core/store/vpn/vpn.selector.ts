import { AppState } from '../app.reducer';
import { createSelector } from '@ngrx/store';
import { VPNState } from './vpn.reducer';

export const selectVPN = (state: AppState) => state.vpn;

export const isVPNConnected = createSelector(
  selectVPN,
  (state: VPNState) => state.connected
);

export const isConnecting = createSelector(
  selectVPN,
  (state: VPNState) => state.connecting
);

export const getSelectedVpnServer = createSelector(
  selectVPN,
  (state: VPNState) => state.selectedServer
);

export const getServerList = createSelector(
  selectVPN,
  (state: VPNState) => state.serverList
);

export const isConnectionError = createSelector(
  selectVPN,
  (state: VPNState) => state.error
);
