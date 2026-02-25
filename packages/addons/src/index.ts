import { DI, IContainer, Registration } from '@aurelia/kernel';
import { IRouteContext, IRouter, IRouterEvents } from '@aurelia/router-lite';
import { ViewportInstructionTree } from '@aurelia/router-lite/dist/types/instructions';
import * as valueConverters  from './value-converters';
import * as services  from './services';

export const DefaultAddonsConfiguration = {
  register(c: IContainer) {
    c.register(valueConverters);
    c.register(services);
    return c;
  }
};


export * from './decorators';
export * from './frameworks';
export * from './helpers';
export * from './services';
export * from './value-converters';