import * as l from 'fancy-log';
const log = <typeof import('fancy-log')>(<any>l);
import * as c from 'chalk';
const chalk = <import('chalk').Chalk>(c.default || c);

export function logAction(msg: string) {
  const cap = browser.desiredCapabilities;
  msg = `${chalk.yellow(`${cap['os']} ${cap['os_version']} - ${cap.browserName} ${cap['browser_version']}`)}: * ${msg}`;
  log(msg);
}
