import { IContainer } from '@aurelia/kernel';
import { RestResourceConfiguration } from './rest-resource';

export const AddonsConfiguration = {
  register(c: IContainer) {
    return c.register(RestResourceConfiguration);
  }
};

export * from './rest-resource';
