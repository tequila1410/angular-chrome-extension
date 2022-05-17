import {ProxyModel} from "../../auth/models/proxy.model";
import { ExclusionLink } from "../models/exclusion-link.model";

export function onAuthRequiredHandler(username: string | null, password: string | null): void {
  console.log('set onAuthRequiredHandler', username, password);
  chrome.webRequest.onAuthRequired.addListener((details: any) => {
    console.log('auth required: ', details);

    return {authCredentials: {username, password}};
  }, {urls: ['<all_urls>']}, ['blocking']);
}

export function onProxyErrorHandler(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.proxy.onProxyError.addListener((details) => {
      resolve(details);
    });
  })
}

export function setProxy(proxy: ProxyModel, exclusionsLinks: ExclusionLink[]): Promise<ProxyModel> {
  console.log('proxy to set: ', proxy);
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
        chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/19x19-green.png')}`});
        resolve(proxy);
      }
    );
  })
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

export function sendMessage(type: string = 'enable.proxy', data: {force: boolean} = {force: true}) {
 chrome.runtime.sendMessage({ type, data }, (response) => {
    console.log('Response data: ', response)
  });
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
