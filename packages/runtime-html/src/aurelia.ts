import { DI, Registration, InstanceProvider, onResolve, emptyArray } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { LifecycleFlags } from '@aurelia/runtime';
import { AppRoot, IAppRoot, ISinglePageApp } from './app-root.js';
import { IEventTarget, INode } from './dom.js';
import { IPlatform } from './platform.js';
import { CustomElement, CustomElementDefinition } from './resources/custom-element.js';
import { Controller, ICustomElementController, ICustomElementViewModel, IHydratedParentController } from './templating/controller.js';

import type {
  Constructable,
  IContainer,
  IDisposable,
} from '@aurelia/kernel';

export interface IAurelia extends Aurelia {}
export const IAurelia = DI.createInterface<IAurelia>('IAurelia');

export class Aurelia implements IDisposable {
  private _isRunning: boolean = false;
  public get isRunning(): boolean { return this._isRunning; }
  private _isStarting: boolean = false;
  public get isStarting(): boolean { return this._isStarting; }
  private _isStopping: boolean = false;
  public get isStopping(): boolean { return this._isStopping; }

  // TODO:
  // root should just be a controller,
  // in all other parts of the framework, root of something is always the same type of that thing
  // i.e: container.root => a container, RouteContext.root => a RouteContext
  // Aurelia.root of a controller hierarchy should behave similarly
  private _root: IAppRoot | undefined = void 0;
  public get root(): IAppRoot {
    if (this._root == null) {
      if (this.next == null) {
        throw new Error(`root is not defined`); // TODO: create error code
      }
      return this.next;
    }
    return this._root;
  }

  private next: IAppRoot | undefined = void 0;

  private readonly rootProvider: InstanceProvider<IAppRoot>;

  public constructor(
    public readonly container: IContainer = DI.createContainer(),
  ) {
    if (container.has(IAurelia, true)) {
      throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
    }

    container.registerResolver(IAurelia, new InstanceProvider<IAurelia>('IAurelia', this));
    container.registerResolver(IAppRoot, this.rootProvider = new InstanceProvider('IAppRoot'));
  }

  public register(...params: any[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider);
    return this;
  }

  /**
   * @param parentController - The owning controller of the view created by this enhance call
   */
  public enhance<T extends unknown, K = T extends Constructable<infer I> ? I : T>(config: IEnhancementConfig<T>, parentController?: IHydratedParentController | null): IEnhancedView<K> | Promise<IEnhancedView<K>> {
    const ctn = config.container ?? this.container;
    const childCtn = ctn.createChild();
    const host = config.host as HTMLElement;
    const p = this.initPlatform(host);
    const comp = config.component as K;
    const resources = config.resources ?? emptyArray;
    let bc: ICustomElementViewModel & K;
    if (typeof comp === 'function') {
      childCtn.registerResolver(
        p.HTMLElement,
        childCtn.registerResolver(
          p.Element,
          childCtn.registerResolver(
            p.Node,
            childCtn.registerResolver(INode, new InstanceProvider('ElementResolver', host))
          )
        )
      );
      bc = childCtn.invoke(comp as unknown as Constructable<ICustomElementViewModel & K>);
    } else {
      bc = comp;
    }
    childCtn.registerResolver(IEventTarget, new InstanceProvider('IEventTarget', host));
    if (resources.length > 0) {
      childCtn.register(...resources);
    }
    parentController = parentController ?? null;

    // todo: shouldn't this be just a synthetic view?
    //       pros of synthetic view:
    //        - is it feels right-er
    //       cons of synthetic view:
    //        - there's no lifecycles
    // todo: should this be move to a method enhance on Controller?
    const view = Controller.forCustomElement(
      childCtn,
      bc,
      host,
      null,
      void 0,
      CustomElementDefinition.create({ name: CustomElement.generateName(), template: host, enhance: true }),
    );
    const enhancedView: IEnhancedView<K> = {
      controller: view,
      deactivate: () => view.deactivate(view, parentController!, LifecycleFlags.fromUnbind)
    };
    return onResolve(
      view.activate(view, parentController, LifecycleFlags.fromBind),
      () => enhancedView
    );
  }

  public async waitForIdle(): Promise<void> {
    const platform = this.root.platform;
    await platform.domWriteQueue.yield();
    await platform.domReadQueue.yield();
    await platform.taskQueue.yield();
  }

  private initPlatform(host: HTMLElement): IPlatform {
    let p: IPlatform;
    if (!this.container.has(IPlatform, false)) {
      if (host.ownerDocument.defaultView === null) {
        throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
      }
      p = new BrowserPlatform(host.ownerDocument.defaultView);
      this.container.register(Registration.instance(IPlatform, p));
    } else {
      p = this.container.get(IPlatform);
    }
    return p;
  }

  private startPromise: Promise<void> | void = void 0;
  public start(root: IAppRoot | undefined = this.next): void | Promise<void> {
    if (root == null) {
      throw new Error(`There is no composition root`);
    }

    if (this.startPromise instanceof Promise) {
      return this.startPromise;
    }

    return this.startPromise = onResolve(this.stop(), () => {
      Reflect.set(root.host, '$aurelia', this);
      this.rootProvider.prepare(this._root = root);
      this._isStarting = true;

      return onResolve(root.activate(), () => {
        this._isRunning = true;
        this._isStarting = false;
        this.startPromise = void 0;
        this.dispatchEvent(root, 'au-started', root.host);
      });
    });
  }

  private stopPromise: Promise<void> | void = void 0;
  public stop(dispose: boolean = false): void | Promise<void> {
    if (this.stopPromise instanceof Promise) {
      return this.stopPromise;
    }

    if (this._isRunning === true) {
      const root = this._root!;
      this._isRunning = false;
      this._isStopping = true;

      return this.stopPromise = onResolve(root.deactivate(), () => {
        Reflect.deleteProperty(root.host, '$aurelia');
        if (dispose) {
          root.dispose();
        }
        this._root = void 0;
        this.rootProvider.dispose();
        this._isStopping = false;
        this.dispatchEvent(root, 'au-stopped', root.host);
      });
    }
  }

  public dispose(): void {
    if (this._isRunning || this._isStopping) {
      throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
    }
    this.container.dispose();
  }

  private dispatchEvent(root: IAppRoot, name: string, target: HTMLElement): void {
    const ev = new root.platform.window.CustomEvent(name, { detail: this, bubbles: true, cancelable: true });
    target.dispatchEvent(ev);
  }
}

export interface IEnhancedView<T> {
  readonly controller: ICustomElementController<ICustomElementViewModel & T>;
  readonly deactivate: () => void | Promise<void>;
}

export interface IEnhancementConfig<T> {
  host: Element;
  /**
   * The binding context of the enhancement. Will be instantiate by DI if a constructor is given
   */
  component: T;
  /**
   * The parent container of the enhanced view.
   *
   * A child contaienr will be spawned from this container for the enhancement.
   *
   * Root container should be used if this is not given
   */
  container?: IContainer;
  /**
   * A list of local resources to use for the enhancement,
   * only available to the directly enhanced view itself
   */
  resources?: unknown[];
}
