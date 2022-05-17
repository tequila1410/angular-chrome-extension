export interface ProxyModel {
  // scheme: 'http' | 'https' | 'quic' | 'socks4' | 'socks5';
  scheme: string;
  host: string;
  port: number;
  id: string;
  locationName: string;
  image: string;
  ping: number;
  isAllowedStream: boolean;
  isAllowedP2P: boolean;
}
