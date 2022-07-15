import {ProxyModel} from "../../auth/models/proxy.model";
import {UserCred} from "../models/user-cred.enum";
import {Observable} from "rxjs";
import {AuthCred} from "../models/user.model";
import {ChromeConfig} from "../models/chrome-config.model";
import pacGenerator from "./pacGenerator";

/**
 * API to observe and analyze traffic and to intercept, block, or modify requests in-flight.
 * @param {string | null} username
 * @param {string | null} password
 */
export function onAuthRequiredHandler(username: string | null, password: string | null): void {
  console.log('set onAuthRequiredHandler', username, password);
  chrome.webRequest.onAuthRequired.addListener(callbackFn, {urls: ['<all_urls>']}, ['blocking']);
}


/**
 * Get auth credetials from local storage
 * @param {any} details
 * @return {AuthCred}
 */
function callbackFn(details: any): AuthCred {

  const username = localStorage.getItem(UserCred.userLogin);
  const password = localStorage.getItem(UserCred.userPassword);

  console.log('proxy ask for creds', username, password);

  return {authCredentials: {username, password}};
}

/**
 * Notifies about proxy errors
 * @return {Promise<any>}
 */
export function onProxyErrorHandler(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.proxy.onProxyError.addListener((details) => {
      resolve(details);
    });
  })
}

/**
 * Set chrome proxy config
 * @param {ProxyModel} proxy
 * @param {string[]} exclusionsLinks
 * @param {boolean} inverted
 * @return {Promise<ProxyModel>}
 */
export function setProxy(proxy: ProxyModel, exclusionsLinks: string[], inverted: boolean): Promise<ProxyModel> {
  return new Promise((resolve, reject) => {

    let config = {
      bypassList: exclusionsLinks,
      host: proxy.host,
      port: proxy.port,
      scheme: proxy.scheme,
      inverted: inverted
    }

    const chromeConfig = convertToChromeConfig(config);

    chrome.proxy.settings.set(chromeConfig, () => {
      resolve(proxy);
    });

  })
}

/**
 * Set the icon for the browser action
 * @param {string} iconPath
 */
export function setIcon(iconPath?: string) {
  chrome.browserAction.setIcon({path: `${chrome.runtime.getURL(iconPath || 'assets/images/icons/19x19-green.png')}`});
}

/**
 * Get proxy from PAC script or singleProxy
 * @return {Observable<any>}
 */
export function getProxyObservable(): Observable<any> {
  return new Observable(subscriber => {
    chrome.proxy.settings.get(
      {'incognito': true},
      (config) => {
        if (config?.value?.pacScript?.data) {
          const pacScript: string = config.value.pacScript.data;
          const from = 'PROXY = "';
          const to = '"';

          let substr = pacScript.slice(pacScript.indexOf(from) + from.length);
          let resultStr = substr.slice(0, substr.indexOf(to));
          let [scheme, hostWithPort] = resultStr.split(' ');
          let [host, port] = hostWithPort.split(':');

          const proxyFromPac: ProxyModel = {
            scheme,
            host,
            port: +port,
            id: '',
            locationCode: '',
            locationName: '',
            image: scheme,
            ping: 0,
            isAllowedP2P: false,
            isAllowedStream: false
          };
          console.log(proxyFromPac);
          subscriber.next(proxyFromPac);
        } else {
          const proxy: ProxyModel = config?.value?.rules?.singleProxy;
          subscriber.next(proxy);
        }
      }
    );
  })
}

/**
 * Clear proxy from chrome settings
 * @return {void}
 */
export function clearProxy(): void {
  chrome.proxy.settings.clear({});
  chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/19x19-grey.png')}`});
}

/**
 * Clear the badge text for the action
 * @return {void}
 */
export function clearBudge(): void {
  chrome.browserAction.setBadgeText({});
}

/**
 * Set the badge text for the action
 * @param {string} text
 */
export function setBadge(text: string): void {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#85a832' }, () => {
    chrome.browserAction.setBadgeText({ text });
  });
}

/**
 * Send a single message to event listeners within your extension
 * @param {string} type
 * @param {{force: boolean}} data
 * @return {void}
 */
export function sendMessage(type: string = 'enable.proxy', data: {force: boolean} = {force: true}): void {
 chrome.runtime.sendMessage({ type, data }, (response) => {
    console.log('Response data: ', response)
  });
}

/**
 * Remove onAuthRequired listener
 * @return {void}
 */
export function removeOnAuthRequiredHandler(): void {
  chrome.webRequest.onAuthRequired.removeListener(callbackFn)
}

/**
 * Check is onAuthRequired listener exist
 * @return {void}
 */
export function checkListener(): void {
  console.log(chrome.webRequest.onAuthRequired.hasListeners());
}

/**
 * Get cookie from chrome
 * @param {string} name
 * @param {string} url
 * @return {Promise<any>}
 */
export function getCookie(name: string, url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(
      {name, url},
      (cookie) => {
        cookie ? resolve(cookie) : reject('No cookie was find.');
      }
    );
  })
}

/**
 * Needs to be called when the behavior of the webRequest handlers has changed to prevent incorrect handling due to caching
 * @return {void}
 */
export function handlerBehaviorChanged(): void {
  chrome.webRequest.handlerBehaviorChanged(() => {
    console.log('handlerBehaviorChanged was called');
  })
}

/**
 * Clear cookie after using
 * @param {string} rootDomain
 * @return {Promise<any>}
 */
export function clearProxyCookie(rootDomain: string): Promise<any> {
  return new Promise((resolve => {
    let options: any = {};
    options.origins = [];
    options.origins.push("http://"+ rootDomain);
    options.origins.push("https://"+ rootDomain);
    let types = {"cookies": true};
    chrome.browsingData.remove(options, types, () => {
      resolve(true);
    });
  }))
}

/**
 * Convert proxy configuration to chrome standart
 * @param {any} proxyConfig
 * @return {ChromeConfig}
 */
function convertToChromeConfig(proxyConfig: any): ChromeConfig {
  const {
    bypassList,
    host,
    port,
    scheme,
    inverted
  } = proxyConfig;

  const proxyAddress = `${host}:${port}`;

  const pacScript = pacGenerator.generate(scheme, proxyAddress, bypassList, inverted);

  return {
    value: {
      mode: 'pac_script',
      pacScript: {
        data: pacScript,
      },
    },
    scope: 'regular',
  };
};
