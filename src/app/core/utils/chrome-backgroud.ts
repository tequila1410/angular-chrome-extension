import {ProxyModel} from "../../auth/models/proxy.model";
import { ExclusionLink } from "../models/exclusion-link.model";
import local = chrome.storage.local;
import {UserCred} from "../models/user-cred.enum";
import pacGenerator from "./pacGenerator";
import {Observable} from "rxjs";

export function onAuthRequiredHandler(username: string | null, password: string | null): void {
  console.log('set onAuthRequiredHandler', username, password);
  chrome.webRequest.onAuthRequired.addListener(callbackFn, {urls: ['<all_urls>']}, ['blocking']);
}

const callbackFn = (details: any) => {

  const username = localStorage.getItem(UserCred.userLogin);
  const password = localStorage.getItem(UserCred.userPassword);

  console.log('proxy ask for creds', username, password);

  return {authCredentials: {username, password}};
}

export function onProxyErrorHandler(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.proxy.onProxyError.addListener((details) => {
      resolve(details);
    });
  })
}

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

export function setIcon(iconPath?: string) {
  chrome.browserAction.setIcon({path: `${chrome.runtime.getURL(iconPath || 'assets/images/icons/19x19-green.png')}`});
}

export function getProxy(): Promise<ProxyModel> {
  return new Promise((resolve, reject) => {
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
          resolve(proxyFromPac);
        } else {
          const proxy: ProxyModel = config?.value?.rules?.singleProxy;
          resolve(proxy);
        }
      }
    );
  })
}

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

export function clearProxy(): void {
  chrome.proxy.settings.clear({});
  chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/19x19-grey.png')}`});
}

export function clearBudge(): void {
  chrome.browserAction.setBadgeText({});
}

export function setBadge(text: string): void {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#85a832' }, () => {
    chrome.browserAction.setBadgeText({ text });
  });
}

export function sendMessage(type: string = 'enable.proxy', data: {force: boolean} = {force: true}) {
 chrome.runtime.sendMessage({ type, data }, (response) => {
    console.log('Response data: ', response)
  });
}

export function removeOnAuthRequiredHandler() {
  chrome.webRequest.onAuthRequired.removeListener(callbackFn)
}

export function checkListener() {
  console.log(chrome.webRequest.onAuthRequired.hasListeners());
}

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

export function handlerBehaviorChanged() {
  chrome.webRequest.handlerBehaviorChanged(() => {
    console.log('handlerBehaviorChanged was called');
  })
}

export function clearProxyCookie(rootDomain: string) {
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

function convertToChromeConfig(proxyConfig: any) {
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
