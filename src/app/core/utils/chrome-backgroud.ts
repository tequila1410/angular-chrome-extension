import {ProxyModel} from "../../auth/models/proxy.model";

export function onAuthRequiredHandler(username: string, password: string): void {
  chrome.webRequest.onAuthRequired.addListener((details: any) => {
    console.log('auth required: ', details);

    return {authCredentials: {username, password}};
  }, {urls: ['<all_urls>']}, ['blocking']);
}

export function onProxyErrorHandler(): void {
  chrome.proxy.onProxyError.addListener((details) => {
    console.log("fatal: ", details.fatal);
    console.log("error: ", details.error);
    console.log("details: ", details.details)
  });
}

export function setProxy(proxy: ProxyModel): Promise<ProxyModel> {
  return new Promise((resolve, reject) => {
    let config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: proxy.scheme,
          host: proxy.host,
          port: proxy.port
        },
        bypassList: ["foobar.com"] // there are list of executed sites could be
      }
    };

    chrome.proxy.settings.set(
      {value: config, scope: 'regular'},
      (details: any) => {
        console.log('set proxy details: ', details);
        chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/enabled-19.png')}`});
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
  chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/disabled-19.png')}`});
}
