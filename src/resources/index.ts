import { PLATFORM } from "@aurelia/kernel";

export function configure(config) {
  config.globalResources([
    './value-converters/date',
    './value-converters/format-html',
    './value-converters/markdown-html',
    './value-converters/keys',
  ]);
}
