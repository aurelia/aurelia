
export function isChrome(): boolean {
  return /chrome/i.test(browser.capabilities.browserName);
}
export function isFirefox(): boolean {
  return /firefox/i.test(browser.capabilities.browserName);
}
export function isEdge(): boolean {
  return /edge/i.test(browser.capabilities.browserName);
}
export function isSafari(): boolean {
  return /safari/i.test(browser.capabilities.browserName);
}
