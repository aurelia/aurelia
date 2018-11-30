// CAVEAT: Custom Elements MUST be defined upfront
//         There is no instance upgrade since it's
//         not possible to reproduce it procedurally.

import broadcast from './broadcast';

export type Constructable<T = any> = new (...args: any[]) => T;

export class CustomElementRegistry {

  _registry: Record<string, Constructable>;

  constructor() {
    this._registry = Object.create(null);
  }

  define(name: string, constructor: Constructable, options: any) {
    if (name in this._registry) {
      throw new Error(name + ' already defined');
    }
    this._registry[name] = constructor;
    broadcast.that(name, constructor);
  }

  get<T = any>(name: string): Constructable<T> {
    return this._registry[name] || null;
  }

  whenDefined(name: string): Promise<void> {
    return broadcast.when(name) as Promise<void>;
  }
}
