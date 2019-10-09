import * as l from 'fancy-log';
import * as c from 'chalk';

const log = l as unknown as typeof import('fancy-log');
const chalk = (c.default || c) as import('chalk').Chalk;

export function logAction(msg: string) {
  const cap = browser.capabilities;
  let osName = cap['os'] || cap.platformName || cap.platform;
  osName = osName.toLowerCase() === 'xp' ? 'windows' : osName.toLowerCase();
  const browserName = cap.browserName || cap['browser'];
  const browserVersion = (cap['browser_version'] || cap.browserVersion || cap.version).split('.')[0];

  msg = `${chalk.yellow(`${osName} - ${browserName} ${browserVersion}`)}: * ${msg}`;
  log(msg);
}
