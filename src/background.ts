import {clearBudge, clearProxy, onAuthRequiredHandler} from "./app/core/utils/chrome-backgroud";
import {nanoid} from "nanoid";

let size = 0;
let timeoutId: any;
let setIntervalId: any;
let startTrackDate: Date;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const n = 10000;

  if (message.type === 'startCheck') {
    chrome.webRequest.onCompleted.addListener(onCompletedListener, {urls: ['<all_urls>']}, ['responseHeaders']);
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestListener, {urls: ['<all_urls>']}, ['requestBody'])
    chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener, {urls: ['<all_urls>']}, ['requestHeaders']);

    chrome.storage.local.get(['startTrackDate'], (result) => {
      startTrackDate = result.startTrackDate || new Date();
      let s = startTrackDate.getTime() - (new Date()).getTime() + n;
      timeoutId = setInterval(() => {
        sendData(size).then(res => {
          if(res.data.isLimit) {
            const notificationOptions = {
              type: 'basic',
              title: 'Zoog VPN',
              iconUrl: 'assets/images/icons/19x19-green.png',
              message: 'Limit reached!',
            };
            chrome.notifications.create(nanoid(), notificationOptions);
            let msg = {
              type: 'stopCheck'
            };
            chrome.runtime.sendMessage('', msg);
          }
          size = 0;
        });
      }, s);
      setIntervalId = setInterval(() => {
        console.log((size / 1000000).toFixed(2) + ' Mb');
      }, 2000)
    });

    console.log('start check');
  } else if (message.type === 'stopCheck') {
    chrome.webRequest.onCompleted.removeListener(onCompletedListener);
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener);
    chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);

    chrome.storage.local.get(['nwUsage'], (result) => {
      if (result.nwUsage) {
        size += result.nwUsage;
        localStorage.removeItem('nwUsage');
        chrome.storage.local.remove('nwUsage');
      }
      console.log((size / 1000000).toFixed(2) + ' Mb');
      clearInterval(timeoutId);
      clearInterval(setIntervalId);
      sendData(size).then((res) => {
        const responseSend = size;
        size -= responseSend;
      });
      console.log('stop check');
    });
  }

  return Promise.resolve();
});

const onCompletedListener = (details: any) => {
  // console.log('____________________________________')
  // console.log(details);
  if (!details.fromCache) {
    details.responseHeaders?.forEach((header: any) => {
      size = size + header.name.length + (header.value?.length || 0);
      if (header.name.toLowerCase() === 'content-length')
        size += +(header.value || 0)
    })
  }
}

const onBeforeRequestListener = (details: any) => {
  if (details.requestBody?.formData) {
    // console.log('____________________________________');
    // console.log(details);
  }
  if (details.requestBody && !details.requestBody.error) {
    if (details.requestBody.raw) {
      size += details.requestBody.raw.length; // details.requestBody.raw[0].bytes.length
    } else if (details.requestBody.formData) {
      for(let key in details.requestBody.formData) {
        size += key.length;
        size += details.requestBody.formData[key][0].length;
      }
    }
  }
}

const onBeforeSendHeadersListener = (details: any) => {
  if (details.requestHeaders) {
    details.requestHeaders.forEach((header: any) => {
      size += header.name?.length + (header.value?.length || 0);
    })
  }
}

const sendData = async (bytes: number): Promise<{data: {status: number, isLimit: boolean}}> => {
  const user = localStorage.getItem('lg');
  const response = await fetch('http://localhost:3001/setSize', {
    method: 'POST',
    body: JSON.stringify({
      size: bytes,
      user
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

chrome.runtime.onInstalled.addListener(() => {
  // chrome.webNavigation.onCompleted.addListener(() => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
  //     if (id) {
  //       chrome.pageAction.show(id);
  //     }
  //   });
  // }, { url: [{ urlMatches: 'google.com' }] });
  chrome.proxy.settings.get(
    {'incognito': true},
    (config) => {
      const proxy = config?.value?.rules?.singleProxy;
      if (proxy) {
        chrome.browserAction.setIcon({path: `${chrome.runtime.getURL('assets/images/icons/19x19-green.png')}`});
        let msg = {
          type: 'startCheck'
        };
        chrome.runtime.sendMessage('', msg);
      }
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
