import { appConfig } from './app-config'; //added by the compiler
import { customElement } from '@aurelia/runtime';
declare var ENV, Monitoring;

@customElement(appConfig) //added by the compiler
export class App {
  databases = [];

  attached() {
    const load = () => {
      this.databases = ENV.generateData().toArray();
      Monitoring.renderRate.ping();
      setTimeout(load, ENV.timeout);
    };

    load();
  }
}
