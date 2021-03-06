export const NON_ROUTABLE_CIDR_NETS = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '14.0.0.0/8',
  '24.0.0.0/8',
  '39.0.0.0/8',
  '127.0.0.0/8',
  '128.0.0.0/16',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '191.255.0.0/16',
  '192.0.0.0/24',
  '192.0.2.0/24',
  '192.88.99.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '223.255.255.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
];

export const IPV4_REGEX = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
