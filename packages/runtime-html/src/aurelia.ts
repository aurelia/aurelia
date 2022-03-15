import { DI, Registration, InstanceProvider, onResolve } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { LifecycleFlags } from '@aurelia/runtime';
import { AppRoot, IAppRoot, ISinglePageApp } from './app-root.js';
import { IEventTarget, INode } from './dom.js';
import { IPlatform } from './platform.js';
import { CustomElement, CustomElementDefinition } from './resources/custom-element.js';
import { Controller, ICustomElementController, ICustomElementViewModel, IHydratedParentController } from './templating/controller.js';
import { isFunction } from './utilities.js';

import type {
  Constructable,
  IContainer,
  IDisposable,
} from '@aurelia/kernel';

export interface IAurelia extends Aurelia {}
export const IAurelia = DI.createInterface<IAurelia>('IAurelia');

export class Aurelia implements IDisposable {
  /** @internal */
  private _isRunning: boolean = false;
  public get isRunning(): boolean { return this._isRunning; }
  /** @internal */
  private _isStarting: boolean = false;
  public get isStarting(): boolean { return this._isStarting; }
  /** @internal */
  private _isStopping: boolean = false;
  public get isStopping(): boolean { return this._isStopping; }

  // TODO:
  // root should just be a controller,
  // in all other parts of the framework, root of something is always the same type of that thing
  // i.e: container.root => a container, RouteContext.root => a RouteContext
  // Aurelia.root of a controller hierarchy should behave similarly
  /** @internal */
  private _root: IAppRoot | undefined = void 0;
  public get root(): IAppRoot {
    if (this._root == null) {
      if (this.next == null) {
        if (__DEV__)
          throw new Error(`root is not defined`);
        else
          throw new Error('AUR0767');
      }
      return this.next;
    }
    return this._root;
  }

  private next: IAppRoot | undefined = void 0;

  /** @internal */
  private readonly _rootProvider: InstanceProvider<IAppRoot>;

  public constructor(
    public readonly container: IContainer = DI.createContainer(),
  ) {
    if (container.has(IAurelia, true)) {
      if (__DEV__)
        throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
      else
        throw new Error('AUR0768');
    }

    container.registerResolver(IAurelia, new InstanceProvider<IAurelia>('IAurelia', this));
    container.registerResolver(IAppRoot, this._rootProvider = new InstanceProvider('IAppRoot'));
  }

  public register(...params: any[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new AppRoot(config, this._initPlatform(config.host), this.container, this._rootProvider);
    return this;
  }

  /**
   * @param parentController - The owning controller of the view created by this enhance call
   */
  public enhance<T, K = T extends Constructable<infer I> ? I : T>(config: IEnhancementConfig<T>, parentController?: IHydratedParentController | null): ICustomElementController<K> | Promise<ICustomElementController<K>> {
    const ctn = config.container ?? this.container.createChild();
    const host = config.host as HTMLElement;
    const p = this._initPlatform(host);
    const comp = config.component as unknown as K;
    let bc: ICustomElementViewModel & K;
    if (isFunction(comp)) {
      ctn.registerResolver(
        p.HTMLElement,
        ctn.registerResolver(
          p.Element,
          ctn.registerResolver(INode, new InstanceProvider('ElementResolver', host))
        )
      );
      bc = ctn.invoke(comp as unknown as Constructable<ICustomElementViewModel & K>);
    } else {
      bc = comp;
    }
    ctn.registerResolver(IEventTarget, new InstanceProvider('IEventTarget', host));
    parentController = parentController ?? null;

    const view = Controller.$el(
      ctn,
      bc,
      host,
      null,
      CustomElementDefinition.create({ name: CustomElement.generateName(), template: host, enhance: true }),
    );
    return onResolve(
      view.activate(view, parentController, LifecycleFlags.fromBind),
      () => view
    );
  }

  public async waitForIdle(): Promise<void> {
    const platform = this.root.platform;
    await platform.domWriteQueue.yield();
    await platform.domReadQueue.yield();
    await platform.taskQueue.yield();
  }

  /** @internal */
  private _initPlatform(host: HTMLElement): IPlatform {
    let p: IPlatform;
    if (!this.container.has(IPlatform, false)) {
      if (host.ownerDocument.defaultView === null) {
        if (__DEV__)
          throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
        else
          throw new Error('AUR0769');
      }
      p = new BrowserPlatform(host.ownerDocument.defaultView);
      this.container.register(Registration.instance(IPlatform, p));
    } else {
      p = this.container.get(IPlatform);
    }
    return p;
  }

  /** @internal */
  private _startPromise: Promise<void> | void = void 0;
  public start(root: IAppRoot | undefined = this.next): void | Promise<void> {
    if (root == null) {
      if (__DEV__)
        throw new Error(`There is no composition root`);
      else
        throw new Error('AUR0770');
    }

    if (this._startPromise instanceof Promise) {
      return this._startPromise;
    }

    return this._startPromise = onResolve(this.stop(), () => {
      Reflect.set(root.host, '$aurelia', this);
      this._rootProvider.prepare(this._root = root);
      this._isStarting = true;

      return onResolve(root.activate(), () => {
        this._isRunning = true;
        this._isStarting = false;
        this._startPromise = void 0;
        this._dispatchEvent(root, 'au-started', root.host);
      });
    });
  }

  /** @internal */
  private _stopPromise: Promise<void> | void = void 0;
  public stop(dispose: boolean = false): void | Promise<void> {
    if (this._stopPromise instanceof Promise) {
      return this._stopPromise;
    }

    if (this._isRunning === true) {
      const root = this._root!;
      this._isRunning = false;
      this._isStopping = true;

      return this._stopPromise = onResolve(root.deactivate(), () => {
        Reflect.deleteProperty(root.host, '$aurelia');
        if (dispose) {
          root.dispose();
        }
        this._root = void 0;
        this._rootProvider.dispose();
        this._isStopping = false;
        this._dispatchEvent(root, 'au-stopped', root.host);
      });
    }
  }

  public dispose(): void {
    if (this._isRunning || this._isStopping) {
      if (__DEV__)
        throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
      else
        throw new Error('AUR0771');
    }
    this.container.dispose();
  }

  /** @internal */
  private _dispatchEvent(root: IAppRoot, name: string, target: HTMLElement): void {
    const ev = new root.platform.window.CustomEvent(name, { detail: this, bubbles: true, cancelable: true });
    target.dispatchEvent(ev);
  }
}

export interface IEnhancementConfig<T> {
  host: Element;
  /**
   * The binding context of the enhancement. Will be instantiate by DI if a constructor is given
   */
  component: T;
  /**
   * A predefined container for the enhanced view.
   */
  container?: IContainer;
}
