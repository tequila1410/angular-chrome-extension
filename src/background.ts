// chrome.runtime.onInstalled.addListener(() => {
//   chrome.webNavigation.onCompleted.addListener(() => {
//     chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
//       if (id) {
//         console.log(chrome);
//         chrome.pageAction.show(id);
//       }
//     });
//   }, { url: [{ urlMatches: 'google.com' }] });
// });
