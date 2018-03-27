import { Aurelia } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import environment from "./environment";

Promise.config({ warnings: { wForgottenReturn: false } });

export function configure(au: Aurelia): void {
  au.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName("resources/index"))
    .plugin(PLATFORM.moduleName("aurelia-validation"));

  if (environment.debug) {
    au.use.developmentLogging();
  }

  if (environment.testing) {
    au.use.plugin(PLATFORM.moduleName("aurelia-testing"));
  }

  au.start().then(() => au.setRoot(PLATFORM.moduleName("app")));
}
