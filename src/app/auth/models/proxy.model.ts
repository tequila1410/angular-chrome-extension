export interface ProxyModel {
  scheme: string;
  host: string;
  port: number;
  id: string;
  locationName: string;
  locationCode: string;
  image: string;
  ping: number;
  isAllowedStream: boolean;
  isAllowedP2P: boolean;
}
