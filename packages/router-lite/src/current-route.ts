import { DI, IDisposable, Writable, emptyArray, resolve } from '@aurelia/kernel';
import { RESIDUE } from '@aurelia/route-recognizer';
import { batch } from '@aurelia/runtime';
import { IRouter } from './router';
import { IRouterEvents } from './router-events';

import type { Params, ViewportInstruction } from './instructions';
import type { RouteConfig } from './route';

let _currentRouteSubscription: IDisposable | null = null;
/** @internal */
export function _disposeCurrentRouteSubscription(): void {
  _currentRouteSubscription?.dispose();
}

export const ICurrentRoute = /*@__PURE__*/ DI.createInterface<ICurrentRoute>('ICurrentRoute', x => x.singleton(CurrentRoute));
export interface ICurrentRoute extends CurrentRoute { }

export class CurrentRoute {
  public readonly path: string = '';
  public readonly url: string = '';
  public readonly title: string = '';
  public readonly query: URLSearchParams = new URLSearchParams();
  public readonly parameterInformation: ParameterInformation[] = emptyArray;

  public constructor() {
    const router = resolve(IRouter);
    const options = router.options;
    _currentRouteSubscription = resolve(IRouterEvents)
      .subscribe('au:router:navigation-end', (event) => {
        const vit = event.finalInstructions;
        batch(() => {
          (this as Writable<CurrentRoute>).path = vit.toPath();
          (this as Writable<CurrentRoute>).url = vit.toUrl(true, options._urlParser);
          (this as Writable<CurrentRoute>).title = router._getTitle();
          (this as Writable<CurrentRoute>).query = vit.queryParams;
          (this as Writable<CurrentRoute>).parameterInformation = vit.children.map((instruction) => ParameterInformation.create(instruction));
        });
      });
  }
}

export class ParameterInformation {
  private constructor(
    public readonly config: RouteConfig | null,
    public readonly viewport: string | null,
    public readonly params: Readonly<Params> | null,
    public readonly children: ParameterInformation[],
  ) { }

  public static create(instruction: ViewportInstruction): ParameterInformation {
    const route = instruction.recognizedRoute?.route;

    const params = Object.create(null);
    Object.assign(params, route?.params ?? instruction.params);
    Reflect.deleteProperty(params, RESIDUE);

    return new ParameterInformation(
      route?.endpoint.route.handler as RouteConfig ?? null,
      instruction.viewport,
      params,
      instruction.children.map((ci) => this.create(ci)),
    );
  }
}
