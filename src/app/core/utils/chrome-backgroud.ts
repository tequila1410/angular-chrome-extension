export function onAuthRequiredHandler(username: string, password: string) {
  chrome.webRequest.onAuthRequired.addListener((details: any) => {
    console.log('auth required: ', details);

    return { authCredentials: {username, password} };
  }, { urls: ['<all_urls>'] }, ['blocking']);
}

export function onProxyErrorHandler() {
  chrome.proxy.onProxyError.addListener((details) => {
    console.log("fatal: ", details.fatal);
    console.log("error: ", details.error);
    console.log("details: ", details.details)
  });
}
