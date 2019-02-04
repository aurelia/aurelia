import { FrameworkConfiguration } from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    './number-value',
    './registration-form',
    './trigger-form',
    './validation-errors-form-one',
    './nullable-object-form'
  ]);
}
