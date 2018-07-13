import { appConfig } from './app-config'; //added by the compiler
import { customElement } from '../runtime/templating/custom-element';
declare var ENV, Monitoring;

@customElement(appConfig) //added by the compiler
export class App {
  databases = [];

  attached() {
    // remove this line below to run the "real" test, this is just to make it possible to get into the debugger
    ENV.timeout = 500;
    
    const load = () => {
      this.databases = ENV.generateData().toArray();
      Monitoring.renderRate.ping();
      setTimeout(load, ENV.timeout);
    };

    load();
  }
}
