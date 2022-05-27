import {ProxyModel} from "../../auth/models/proxy.model";
import { ExclusionLink } from "../models/exclusion-link.model";
import local = chrome.storage.local;
import {UserCred} from "../models/user-cred.enum";

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

export function setProxy(proxy: ProxyModel, exclusionsLinks: ExclusionLink[]): Promise<ProxyModel> {
  return new Promise((resolve, reject) => {
    let config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: proxy.scheme,
          host: proxy.host,
          port: proxy.port
        },
        bypassList: exclusionsLinks
      }
    };
    chrome.proxy.settings.set(
      {value: config, scope: 'regular'},
      (details: any) => {
        console.log('set proxy details: ', details);
        resolve(proxy);
      }
    );
  })
}

export function setIcon(iconPath?: string) {
  chrome.browserAction.setIcon({path: `${chrome.runtime.getURL(iconPath || 'assets/images/icons/19x19-green.png')}`});
}

export function getProxy(): Promise<ProxyModel> {
  return new Promise((resolve, reject) => {
    chrome.proxy.settings.get(
      {'incognito': false},
      (config) => {
        const proxy: ProxyModel = config?.value?.rules?.singleProxy;
        resolve(proxy);
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
