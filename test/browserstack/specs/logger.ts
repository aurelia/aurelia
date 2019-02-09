import * as l from 'fancy-log';
const log = <typeof import('fancy-log')>(<any>l);
import * as c from 'chalk';
const chalk = <import('chalk').Chalk>(c.default || c);

export function logAction(msg: string) {
  const cap = browser.capabilities;
  msg = `${chalk.yellow(`${cap.platformName} ${cap.platformVersion} - ${cap.browserName} ${cap.browserVersion}`)}: * ${msg}`;
  log(msg);
}
