// import {convertCidrToNet} from "./util";
// import {IPV4_REGEX} from "./constans";

/**
 * Returns pac script text
 * We use pacScriptTimeToLiveMs in order to make pac script file inactive if
 * it remained in the proxy setting after browser restart
 * @param proxy
 * @param exclusionsList
 * @param inverted
 * @returns {string}
 */
function proxyPacScript(scheme: string, proxy: string, exclusionsList: string[], inverted: boolean) {
  // Used to adjust pacscript after application or browser restart
  const pacScriptTimeToLiveMs = 200;
  // Used to adjust pacscript lifetime after internet reconnection
  // After this period of time pacscript is always considered activated
  const pacScriptActivationTimeoutMs = 2000;
  return `
            let active = false;
            const created = ${Date.now()};
            const started = Date.now();

            if (started < (created + ${pacScriptTimeToLiveMs})) {
              active = true;
            }

            function FindProxyForURL(url, host) {
                const DIRECT = "DIRECT";
                const PROXY = "${scheme.toUpperCase()} ${proxy}";

                if (!active && (Date.now() > started + ${pacScriptActivationTimeoutMs})) {
                    active = true;
                }

                if (!active) {
                    return DIRECT;
                }

                const areHostnamesEqual = (hostnameA, hostnameB) => {
                    const wwwRegex = /^www\\./;
                    const oldHostnameWithoutWww = hostnameA.replace(wwwRegex, '');
                    const newHostnameWithoutWww = hostnameB.replace(wwwRegex, '');
                    return oldHostnameWithoutWww === newHostnameWithoutWww;
                };

                if (isPlainHostName(host)
                    || shExpMatch(host, 'localhost')) {
                    return DIRECT;
                }

                const inverted = ${inverted};
                const list = ${JSON.stringify(exclusionsList)};

                if (list.some(el => (areHostnamesEqual(host, el) || shExpMatch(host, el)))) {
                    if (inverted) {
                        return PROXY;
                    } else {
                        return DIRECT;
                    }
                }

                return inverted ? DIRECT : PROXY;
            }`;
}

function directPacScript() {
  return `function FindProxyForURL() {
        return 'DIRECT';
    }`;
}

/**
 * @param {string} scheme
 * @param {string} proxy
 * @param {string[]} exclusionsList
 * @param {boolean} inverted
 * @return {string}
 */
const generate = (scheme: string, proxy: string, exclusionsList: string[], inverted: boolean) => {
  if (!proxy) {
    return directPacScript();
  }

  // const nonRoutableNets = nonRoutableCidrNets.map((net) => {
  //   return convertCidrToNet(net);
  // });

  return proxyPacScript(scheme, proxy, exclusionsList, inverted);
};

export default { generate };
