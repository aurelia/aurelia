import * as browserstack from 'browserstack-local';
// tslint:disable-next-line:no-import-side-effect
import 'chromedriver';
import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import targets from './targets';
import * as os from 'os';

export class TestSession {
  public static get IS_BROWSERSTACK(): boolean {
    const val = !!process.env.IS_BROWSERSTACK;
    console.log(`IS_BROWSERSTACK: ${val}`);
    return val;
  }
  public static get BS_TARGET(): typeof targets[keyof typeof targets] {
    const val = targets[process.env.BS_TARGET || 'chromeWin'];
    console.log(`BS_TARGET: ${val}`);
    return val;
  }
  public static get BS_LOCAL(): string {
    const val = process.env.BS_LOCAL || 'true';
    console.log(`BS_LOCAL: ${val}`);
    return val;
  }
  public static get BS_DEBUG(): string {
    const val = process.env.BS_DEBUG || 'true';
    console.log(`BS_DEBUG: ${val}`);
    return val;
  }
  public static get BS_CONSOLE(): string {
    const val = process.env.BS_CONSOLE || 'warnings';
    console.log(`BS_CONSOLE: ${val}`);
    return val;
  }
  public static get BS_NETWORK_LOGS(): string {
    const val = process.env.BS_NETWORK_LOGS || 'true';
    console.log(`BS_NETWORK_LOGS: ${val}`);
    return val;
  }
  public static get BS_TIMEZONE(): string {
    const val = process.env.BS_TIMEZONE || 'UTC';
    console.log(`BS_TIMEZONE: ${val}`);
    return val;
  }
  // public static get BS_SELENIUM_VERSION(): string {
  //   const val = process.env.BS_SELENIUM_VERSION || '3.9.1';
  //   console.log(`BS_SELENIUM_VERSION: ${val}`);
  //   return val;
  // }
  public static get BS_SERVER(): string {
    // tslint:disable-next-line:no-http-string
    const val = process.env.BS_SERVER || 'http://hub-cloud.browserstack.com/wd/hub';
    console.log(`BS_SERVER: ${val}`);
    return val;
  }
  public static get BS_USER(): string {
    if (!!process.env.BS_USER) {
      return process.env.BS_USER;
    }
    throw new Error('BrowserStack username must be set to the BS_USER env variable');
  }
  public static get BS_KEY(): string {
    if (!!process.env.BS_KEY) {
      return process.env.BS_KEY;
    }
    throw new Error('BrowserStack key must be set to the BS_KEY env variable');
  }
  public static get WD_BROWSER(): string {
    const val = process.env.WD_BROWSER || 'chrome';
    console.log(`WD_BROWSER: ${val}`);
    return val;
  }
  public static get APP_PORT(): string {
    const val = process.env.APP_PORT || '3000';
    console.log(`APP_PORT: ${val}`);
    return val;
  }
  public static get APP_HOST(): string {
    let val = process.env.APP_HOST;
    if (!val) {
      const nics = os.networkInterfaces();
      outer: for (const name in nics) {
        for (const nic of nics[name]) {
          if (nic.family !== 'IPv4' || nic.internal !== false) {
            continue;
          }
          val = nic.address;
          break outer;
        }
      }
    }
    console.log(`APP_HOST: ${val}`);
    return val;
  }
  public browser: ThenableWebDriver;
  private local: any;

  public static async start(): Promise<TestSession> {
    const session = new TestSession();
    if (this.IS_BROWSERSTACK) {
      session.local = new browserstack.Local();
      await new Promise(resolve => {
        session.local.start({ key: this.BS_KEY }, resolve);
      });
      const capabilities = {
        ...this.BS_TARGET,
        ['browserstack.local']: this.BS_LOCAL,
        ['browserstack.debug']: this.BS_DEBUG,
        ['browserstack.console']: this.BS_CONSOLE,
        ['browserstack.networkLogs']: this.BS_NETWORK_LOGS,
        ['browserstack.timezone']: this.BS_TIMEZONE,
        //['browserstack.selenium_version']: this.BS_SELENIUM_VERSION,
        ['browserstack.user']: this.BS_USER,
        ['browserstack.key']: this.BS_KEY
      };
      session.browser = new Builder()
        .usingServer(this.BS_SERVER)
        .withCapabilities(capabilities)
        .build();
    } else {
      session.browser = new Builder()
        .forBrowser(this.WD_BROWSER)
        .build();
    }
    return session;
  }
  public async stop(): Promise<void> {
    await this.browser.quit();
    if (TestSession.IS_BROWSERSTACK) {
      await new Promise(resolve => {
        this.local.stop(resolve);
      });
    }
  }
}
