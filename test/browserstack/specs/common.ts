
export function isChrome(): boolean {
  return /chrome/i.test(browser.desiredCapabilities.browserName);
}
export function isFirefox(): boolean {
  return /firefox/i.test(browser.desiredCapabilities.browserName);
}
export function isEdge(): boolean {
  return /edge/i.test(browser.desiredCapabilities.browserName);
}
export function isSafari(): boolean {
  return /safari/i.test(browser.desiredCapabilities.browserName);
}
export function isMac(): boolean {
  return /os x/i.test(browser.desiredCapabilities['os']);
}
export function isWindows(): boolean {
  return /windows/i.test(browser.desiredCapabilities['os']);
}
