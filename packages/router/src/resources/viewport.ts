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
} from '@aurelia/runtime';
import { IRouter } from '../router';
import { Viewport, IViewportOptions } from '../viewport';

export interface IRoutingController extends ICustomElementController<Element> {
  routingContainer?: IContainer;
}
export interface IConnectionCustomElement extends ICustomElementViewModel<Element> {
  element: Element;
  container: IContainer;
  controller: IRoutingController;
}

export const ParentViewport = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport',
  injectable: ParentViewport
})
export class ViewportCustomElement implements ICustomElementViewModel<Element> {
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

  public readonly $controller!: ICustomElementController<Element, this>;

  public controller!: IRoutingController;
  public readonly element: Element;

  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @IContainer public container: IContainer,
    @ParentViewport private readonly parentViewport: ViewportCustomElement,
  ) {
    this.element = element as Element;
  }

  public afterCompile(controller: ICompiledCustomElementController) {
    this.controller = controller as IRoutingController;
    this.container = controller.context.get(IContainer);
    // console.log('Viewport creating', this.getAttribute('name', this.name), this.container, this.parentViewport, controller, this);
    // this.connect();
  }

  public afterBind(initiator: IHydratedController<Element>, parent: IHydratedParentController<Element> | null, flags: LifecycleFlags): void | Promise<void> {
    this.isBound = true;
    this.connect();
  }

  public async afterAttach(initiator: IHydratedController<Element>, parent: IHydratedParentController<Element> | null, flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      this.viewport.enabled = true;
      // Only acts if not already entered
      await this.viewport.content?.enter(this.viewport.content.instruction);
      await this.viewport.content?.activateComponent(initiator, this.$controller, flags, this);
      // TODO: Restore scroll state
    }
  }

  public async beforeDetach(initiator: IHydratedController<Element>, parent: ISyntheticView<Element> | ICustomElementController<Element, ICustomElementViewModel<Element>> | null, flags: LifecycleFlags): Promise<void> {
    // TODO: Save scroll state
  }

  public async beforeUnbind(initiator: IHydratedController<Element>, parent: ISyntheticView<Element> | ICustomElementController<Element, ICustomElementViewModel<Element>> | null, flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      // Only acts if not already left
      await this.viewport.content?.leave(this.viewport.content.instruction);
      await this.viewport.content?.deactivateComponent(initiator, this.$controller as ICustomElementController<Element, ICustomElementViewModel<Element>>, flags, this,
        this.viewport.doForceRemove
          ? false
          : this.router.statefulHistory || this.viewport.options.stateful);
      this.viewport.enabled = false;
    }
  }

  public async afterUnbind(initiator: IHydratedController<Element>, parent: ISyntheticView<Element> | ICustomElementController<Element, ICustomElementViewModel<Element>> | null, flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
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


      this.disconnect();
    }
    this.isBound = false;
  }

  public connect(): void {
    if (this.router.rootScope === null) {
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
    return void 0;
  }
}
