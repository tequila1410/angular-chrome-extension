import { onAuthRequiredHandler } from "./app/core/utils/chrome-backgroud";

chrome.runtime.onInstalled.addListener(() => {
  chrome.webNavigation.onCompleted.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
      if (id) {
        chrome.pageAction.show(id);
      }
    });
  }, { url: [{ urlMatches: 'google.com' }] });
  chrome.proxy.settings.get(
    {'incognito': false},
    (config) => {
      const proxy = config?.value?.rules?.singleProxy;
      if (proxy)
        chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/19x19-green.png')}`});
    }
  );
});

window.addEventListener('load', (event) => {
  const username = localStorage.getItem('lg');
  const password = localStorage.getItem('ps');

  if (username && password) {
    onAuthRequiredHandler(username, password)
  }
});