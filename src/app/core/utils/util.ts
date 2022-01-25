import * as ipaddr from "ipaddr.js"

export function transformHttpError(some: any) {
  let error = '';
  for (let key in some) {
    let str = some[key].join(' ');
    error += str;
  }

  return error;
}

export const isInNet = (host: string, pattern: string, mask: string) => {
  const addr = ipaddr.parse(host);
  // @ts-ignore
  return addr.match([
    ipaddr.IPv4.parse(pattern),
    ipaddr.IPv4.parse(mask).prefixLengthFromSubnetMask() || 0
  ]);
};

export const convertCidrToNet = (cidr: any) => {
  const [ipAddress, subnetPrefix] = ipaddr.parseCIDR(cidr);
  return [
    ipAddress.toString(),
    ipaddr.IPv4.subnetMaskFromPrefixLength(subnetPrefix).toString(),
  ];
};
