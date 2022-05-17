import FingerprintJS from '@fingerprintjs/fingerprintjs'

const fpPromise = FingerprintJS.load();

export async function getFingerPrint(): Promise<string> {
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}
