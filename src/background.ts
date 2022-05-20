
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
      localStorage.setItem('a', JSON.stringify(config))
      if (proxy)
        chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/19x19-green.png')}`});
    }
  );
});
