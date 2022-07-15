import FingerprintJS from '@fingerprintjs/fingerprintjs'

/**
 * Variable for load FingerprintJS
 */
const fpPromise = FingerprintJS.load();

/**
 * Creates a fingerprint
 * @return {Promise<string>}
 */
export async function getFingerPrint(): Promise<string> {
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}
