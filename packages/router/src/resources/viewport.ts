import { IContainer } from '@aurelia/kernel';
import {
  bindable,
  INode,
  LifecycleFlags,
  customElement,
  CustomElement,
  ICompiledCustomElementController,
  ICustomElementViewModel,
  ICustomElementController,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
} from '@aurelia/runtime-html';
import { IRouter } from '../router';
import { Viewport, IViewportOptions } from '../viewport';
import { ViewportScopeCustomElement } from './viewport-scope';
import { Runner } from '../runner';

export interface IRoutingController extends ICustomElementController {
  routingContainer?: IContainer;
}
export interface IConnectedCustomElement extends ICustomElementViewModel {
  element: Element;
  container: IContainer;
  controller: IRoutingController;
}

export const ParentViewport = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport',
  injectable: ParentViewport
})
export class ViewportCustomElement implements ICustomElementViewModel {
  @bindable public name: string = 'default';
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: string = '';
  @bindable public noScope: boolean = false;
  @bindable public noLink: boolean = false;
  @bindable public noTitle: boolean = false;
  @bindable public noHistory: boolean = false;
  @bindable public stateful: boolean = false;

  public viewport: Viewport | null = null;

  public readonly $controller!: ICustomElementController<this>;

  public controller!: IRoutingController;
  public readonly element: Element;

  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @IContainer public container: IContainer,
    @ParentViewport public readonly parentViewport: ViewportCustomElement,
  ) {
    this.element = element as Element;
  }

  public hydrated(controller: ICompiledCustomElementController) {
    // console.log('hydrated', this.name, this.router.isActive);
    this.controller = controller as IRoutingController;
    this.container = controller.context.get(IContainer);

    // The first viewport(s) might be compiled before the router is active
    return Runner.run(
      () => this.waitForRouterStart(),
      () => {
        if (this.router.isRestrictedNavigation) {
          this.connect();
        }
      }
    );
  }

  public binding(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    this.isBound = true;
    return Runner.run(
      () => this.waitForRouterStart(),
      () => {
        if (!this.router.isRestrictedNavigation) {
          this.connect();
        }
      }
    );
  }

  public afterAttach(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
      // console.log('afterAttach', this.viewport?.toString());
      this.viewport.enabled = true;
      return this.viewport.activate(initiator, this.$controller, flags, true);
      // TODO: Restore scroll state
    }
  }

  public beforeUnbind(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
      // console.log('beforeUnbind', this.viewport?.toString());
      // TODO: Save to cache, something like
      // this.viewport.cacheContent();
      // From viewport-content:
      // public unloadComponent(cache: ViewportContent[], stateful: boolean = false): void {
      //   // TODO: We might want to do something here eventually, who knows?
      //   if (this.contentStatus !== ContentStatus.loaded) {
      //     return;
      //   }

      //   // Don't unload components when stateful
      //   if (!stateful) {
      //     this.contentStatus = ContentStatus.created;
      //   } else {
      //     cache.push(this);
      //   }
      // }

      // TODO: Save scroll state before detach

      return Runner.run(
        () => this.viewport!.deactivate(initiator, parent, flags),
        () => {
          this.isBound = false;
          this.viewport!.enabled = false;
        }
      );

      // this.isBound = false;

      // this.viewport.enabled = false;
      // return this.viewport.deactivate(initiator, parent, flags);
      // // this.viewport.enabled = false;
    }
  }

  // public beforeDetach(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController<ICustomElementViewModel> | null, flags: LifecycleFlags): void | Promise<void> {
  //   if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
  //     console.log('beforeDetach', this.viewport?.toString());
  //   }
  // }

  public dispose(): void | Promise<void> {
    if (this.viewport !== null) {
      return Runner.run(
        () => (this.viewport?.nextContent ?? null) === null ? this.viewport?.dispose() : void 0,
        () => this.disconnect()
      );
    }
  }

  public connect(): void {
    if (this.router.rootScope === null || (this.viewport !== null && this.router.isRestrictedNavigation)) {
      return;
    }
    // let controllerContainer = (this.controller.context as any).container;
    // let output = '';
    // do {
    //   console.log(output, ':', controllerContainer === this.container, this.controller, controllerContainer, this.container);
    //   if (controllerContainer === this.container) {
    //     break;
    //   }
    //   controllerContainer = controllerContainer.parent;
    //   output += '.parent';
    // } while (controllerContainer);

    const name: string = this.getAttribute('name', this.name) as string;
    let value: string | boolean | undefined = this.getAttribute('no-scope', this.noScope);
    const options: IViewportOptions = { scope: value === void 0 || !value ? true : false };
    value = this.getAttribute('used-by', this.usedBy);
    if (value !== void 0) {
      options.usedBy = value as string;
    }
    value = this.getAttribute('default', this.default);
    if (value !== void 0) {
      options.default = value as string;
    }
    value = this.getAttribute('fallback', this.fallback);
    if (value !== void 0) {
      options.fallback = value as string;
    }
    value = this.getAttribute('no-link', this.noLink, true);
    if (value !== void 0) {
      options.noLink = value as boolean;
    }
    value = this.getAttribute('no-title', this.noTitle, true);
    if (value !== void 0) {
      options.noTitle = value as boolean;
    }
    value = this.getAttribute('no-history', this.noHistory, true);
    if (value !== void 0) {
      options.noHistory = value as boolean;
    }
    value = this.getAttribute('stateful', this.stateful, true);
    if (value !== void 0) {
      options.stateful = value as boolean;
    }
    this.controller.routingContainer = this.container;
    this.viewport = this.router.connectViewport(this.viewport, this, name, options);
  }
  public disconnect(): void {
    if (this.viewport) {
      this.router.disconnectViewport(this.viewport, this);
    }
    this.viewport = null;
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
    const result: Record<string, string | boolean> = {};
    if (this.isBound && !checkExists) {
      return value;
    } else {
      if (this.element.hasAttribute(key)) {
        if (checkExists) {
          return true;
        } else {
          value = this.element.getAttribute(key) as string;
          if (value.length > 0) {
            return value;
          }
        }
      }
    }
    return value;
  }

  private getClosestCustomElement() {
    let parent: any = this.controller.parent;
    let customElement = null;
    while (parent !== null && customElement === null) {
      if (parent.viewModel instanceof ViewportCustomElement || parent.viewModel instanceof ViewportScopeCustomElement) {
        customElement = parent.viewModel;
      }
      parent = parent.parent;
    }
    return customElement;
  }

  // TODO: Switch this to use (probably) an event instead
  private waitForRouterStart(): void | Promise<void> {
    if (this.router.isActive) {
      return;
    }
    return new Promise((resolve) => {
      this.router.starters.push(resolve);
    });
  }
}
