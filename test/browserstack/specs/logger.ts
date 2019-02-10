import * as l from 'fancy-log';
const log = <typeof import('fancy-log')>(<any>l);
import * as c from 'chalk';
const chalk = <import('chalk').Chalk>(c.default || c);

export function logAction(msg: string) {
  const cap = browser.capabilities;
  let osName = cap['os'] || cap.platformName || cap.platform;
  osName = osName.toLowerCase() === 'xp' ? 'windows' : osName.toLowerCase();
  const browserName = cap.browserName || cap['browser'];
  const browserVersion = (cap['browser_version'] || cap.browserVersion || cap.version).split('.')[0];

  msg = `${chalk.yellow(`${osName} - ${browserName} ${browserVersion}`)}: * ${msg}`;
  log(msg);
}
