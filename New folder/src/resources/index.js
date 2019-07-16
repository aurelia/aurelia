import {PLATFORM} from 'aurelia-pal';

export function configure(config) {
  config.globalResources([
    PLATFORM.moduleName('./value-converters/date'),
    PLATFORM.moduleName('./value-converters/format-html'),
    PLATFORM.moduleName('./value-converters/markdown-html'),
    PLATFORM.moduleName('./value-converters/keys'),
  ]);
}
