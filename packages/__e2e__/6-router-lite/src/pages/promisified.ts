import { IRouteViewModel, ChildActivationSuspensionInstruction, Params, route, RouteNode } from '@aurelia/router-lite';
import { customElement } from 'aurelia';

@customElement({
  name: 'c-1',
  template: `child one`
})
export class C1 { }

@customElement({
  name: 'c-2',
  template: `child two`
})
export class C2 { }

@route({ routes: [C1, C2] })
@customElement({
  name: 'pro-misified',
  template: `<template>
  <template promise.bind="loadingPromise">
    <template pending>
      Please wait...
      <button click.trigger="promiseResolver()">Resolve</button>
      <button click.trigger="promiseRejector()">Cancel</button>
    </template>
    <au-viewport then></au-viewport>
  </template>
</template>`
})
export class Promisified implements IRouteViewModel {
  private loadingPromise!: Promise<void>;
  private promiseResolver: () => void;
  private promiseRejector: () => void;

  public canLoad(_params: Params, _next: RouteNode, _current: RouteNode | null): ChildActivationSuspensionInstruction{
    this.loadingPromise = new Promise((resolve, reject) => {
      this.promiseResolver = resolve;
      this.promiseRejector = reject;
    });
    return {
      continueOn: 'completion',
      promise: this.loadingPromise
    };
    // return this.loadingPromise;
  }
}
