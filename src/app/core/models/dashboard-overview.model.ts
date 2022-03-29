export interface DashboardOverview {
  accountDetails: {
    accountStatus: string;
    signedUpDate: string;
    monthlyBandwidthAllowance: number;
    monthlyUsedBandwidth: number;
    expireDate: string;
    availableDevices: string;
    tariffKey: string;
  };
  vpnLocations: {
    allLocationsCount: number;
    availableLocationsCount: number;
  };
  availableFeatures: {
    tariffId: number;
    tariffKey: string;
    locations: string;
    torrentP2P: boolean;
    unlimitedDevices: boolean;
    unlimitedBandwidth: boolean;
    unlimitedP2p: boolean;
    zeroLogs: boolean;
    encryption256Bit: boolean;
    fullFeatures: boolean;
    fullContentAccess: boolean;
    services: string[];
  }
}
