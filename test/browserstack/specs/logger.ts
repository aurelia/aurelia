import * as c from 'chalk';
import * as l from 'fancy-log';

const chalk = ((c as {default?: unknown}).default || c) as typeof import('chalk');
const log = ((l as {default?: unknown}).default || l) as typeof import('fancy-log');

export function logAction(msg: string) {
  const cap = browser.capabilities;
  let osName = cap['os'] || cap.platformName || cap.platform;
  osName = osName.toLowerCase() === 'xp' ? 'windows' : osName.toLowerCase();
  const browserName = cap.browserName || cap['browser'];
  const browserVersion = (cap['browser_version'] || cap.browserVersion || cap.version).split('.')[0];

  msg = `${chalk.yellow(`${osName} - ${browserName} ${browserVersion}`)}: * ${msg}`;
  log(msg);
}
