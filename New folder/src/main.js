import environment from './environment';
import {PLATFORM} from 'aurelia-pal';
import 'babel-polyfill';
//import * as Bluebird from 'bluebird';
import {HttpClient} from "aurelia-fetch-client";
import {HttpInterceptor} from "./shared/services/http-interceptor";

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
//Bluebird.config({ warnings: { wForgottenReturn: false } });

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .feature(PLATFORM.moduleName('shared/index'));

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  configureHttpClient(aurelia.container);

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}

function configureHttpClient(container) {
  let http = container.get(HttpClient);
  let interceptor = container.get(HttpInterceptor);
  http.configure(config => {
    config
      .withDefaults()
      .withInterceptor(interceptor);
  });
}
