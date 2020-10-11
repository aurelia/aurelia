import {
  Constructable,
  DI,
  IContainer,
  PLATFORM,
  Registration,
  InstanceProvider,
  IDisposable,
  onResolve,
  resolveAll
} from '@aurelia/kernel';
import {
  IDOM,
  INode
} from './dom';
import {
  BindingStrategy,
  LifecycleFlags,
} from './flags';
import {
  ICustomElementViewModel,
  ILifecycle,
  ICustomElementController,
} from './lifecycle';
import { IAppTask, TaskSlot } from './lifecycle-task';
import { CustomElement, CustomElementDefinition } from './resources/custom-element';
import { Controller } from './templating/controller';
import { HooksDefinition } from './definitions';

export interface ISinglePageApp<THost extends INode = INode> {
  strategy?: BindingStrategy;
  dom?: IDOM;
  host: THost;
  component: unknown;
}

type Publisher = { dispatchEvent(evt: unknown, options?: unknown): void };

export interface ICompositionRoot<T extends INode = INode> extends CompositionRoot<T> {}
export const ICompositionRoot = DI.createInterface<ICompositionRoot>('ICompositionRoot').noDefault();

export class CompositionRoot<T extends INode = INode> implements IDisposable {
  public readonly container: IContainer;
  public readonly host: T & { $aurelia?: IAurelia<T> };
  public readonly dom: IDOM<T>;

  public controller: ICustomElementController<T> = (void 0)!;

  private hydratePromise: Promise<void> | void = void 0;
  private readonly enhanceDefinition: CustomElementDefinition | undefined;
  private readonly strategy: BindingStrategy;
  private readonly lifecycle: ILifecycle;

  public constructor(
    public readonly config: ISinglePageApp<T>,
    container: IContainer,
    rootProvider: InstanceProvider<ICompositionRoot<T>>,
    enhance: boolean = false,
  ) {
    rootProvider.prepare(this);
    if (config.host != void 0) {
      if (container.has(INode, false)) {
        this.container = container.createChild();
      } else {
        this.container = container;
      }
      Registration.instance(INode, config.host).register(this.container);
      this.host = config.host;
    } else if (container.has(INode, true)) {
      this.container = container;
      this.host = container.get(INode) as T;
    } else {
      throw new Error(`No host element found.`);
    }
    this.strategy = config.strategy ?? BindingStrategy.getterSetter;
    this.dom = this.container.get(IDOMInitializer).initialize(config) as IDOM<T>;
    this.lifecycle = this.container.get(ILifecycle);

    if (enhance) {
      const component = config.component as Constructable | ICustomElementViewModel<T>;
      this.enhanceDefinition = CustomElement.getDefinition(
        CustomElement.isType(component)
          ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
          : CustomElement.define({ name: (void 0)!, template: this.host, enhance: true, hooks: new HooksDefinition(component) })
      );
    }

    this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
      const instance = CustomElement.isType(config.component as Constructable)
        ? this.container.get(config.component as Constructable | {}) as ICustomElementViewModel<T>
        : config.component as ICustomElementViewModel<T>;

      const controller = (this.controller = Controller.forCustomElement(
        this,
        container,
        instance,
        this.lifecycle,
        this.host,
        null,
        this.strategy as number,
        false,
        this.enhanceDefinition,
      )) as Controller<T>;

      controller.hydrateCustomElement(container, null);
      return onResolve(this.runAppTasks('beforeCompile'), () => {
        controller.compile(null);
        return onResolve(this.runAppTasks('beforeCompileChildren'), () => {
          controller.compileChildren();
          this.hydratePromise = void 0;
        });
      });
    });
  }

  public activate(): void | Promise<void> {
    return onResolve(this.hydratePromise, () => {
      return onResolve(this.runAppTasks('beforeActivate'), () => {
        return onResolve(this.controller.activate(this.controller, null, this.strategy | LifecycleFlags.fromBind, void 0), () => {
          return this.runAppTasks('afterActivate');
        });
      });
    });
  }

  public deactivate(): void | Promise<void> {
    return onResolve(this.runAppTasks('beforeDeactivate'), () => {
      return onResolve(this.controller.deactivate(this.controller, null, this.strategy | LifecycleFlags.none), () => {
        return this.runAppTasks('afterDeactivate');
      });
    });
  }

  /** @internal */
  public runAppTasks(slot: TaskSlot): void | Promise<void> {
    return resolveAll(...this.container.getAll(IAppTask).reduce((results, task) => {
      if (task.slot === slot) {
        results.push(task.run());
      }
      return results;
    }, [] as (void | Promise<void>)[]));
  }

  public dispose(): void {
    this.controller?.dispose();
  }
}

export interface IAurelia<T extends INode = INode> extends Aurelia<T> {}
export const IAurelia = DI.createInterface<IAurelia>('IAurelia').noDefault();

export class Aurelia<TNode extends INode = INode> implements IDisposable {
  private _isRunning: boolean = false;
  public get isRunning(): boolean { return this._isRunning; }
  private _isStarting: boolean = false;
  public get isStarting(): boolean { return this._isStarting; }
  private _isStopping: boolean = false;
  public get isStopping(): boolean { return this._isStopping; }

  private _root: ICompositionRoot<TNode> | undefined = void 0;
  public get root(): ICompositionRoot<TNode> {
    if (this._root == void 0) {
      if (this.next == void 0) {
        throw new Error(`root is not defined`); // TODO: create error code
      }
      return this.next;
    }
    return this._root;
  }

  private next: ICompositionRoot<TNode> | undefined = void 0;

  private readonly rootProvider: InstanceProvider<ICompositionRoot<TNode>>;

  public constructor(
    public readonly container: IContainer = DI.createContainer(),
  ) {
    if (container.has(IAurelia, true)) {
      throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
    }

    container.register(Registration.instance(IAurelia, this));
    container.registerResolver(ICompositionRoot, this.rootProvider = new InstanceProvider());
  }

  public register(...params: any[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp<TNode>): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new CompositionRoot(config, this.container, this.rootProvider, false);
    return this;
  }

  public enhance(config: ISinglePageApp<TNode>): Omit<this, 'register' | 'app' | 'enhance'> {
    this.next = new CompositionRoot(config, this.container, this.rootProvider, true);
    return this;
  }

  private startPromise: Promise<void> | void = void 0;
  public start(root: ICompositionRoot<TNode> | undefined = this.next): void | Promise<void> {
    if (root == void 0) {
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
        this.dispatchEvent(root, 'aurelia-composed', root.dom);
        this.dispatchEvent(root, 'au-started', root.host);
      });
    });
  }

  private stopPromise: Promise<void> | void = void 0;
  public stop(): void | Promise<void> {
    if (this.stopPromise instanceof Promise) {
      return this.stopPromise;
    }

    if (this._isRunning === true) {
      const root = this._root!;
      this._isRunning = false;
      this._isStopping = true;

      return this.stopPromise = onResolve(root.deactivate(), () => {
        Reflect.deleteProperty(root.host, '$aurelia');
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
    this._root?.dispose();
    this._root = void 0;
    this.container.dispose();
  }

  private dispatchEvent(root: ICompositionRoot, name: string, target: IDOM<TNode> | (TNode & Partial<Publisher>)): void {
    const $target = ('dispatchEvent' in target ? target : root.dom) as Publisher;
    $target.dispatchEvent(root.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
  }
}
(PLATFORM.global as typeof PLATFORM.global & { Aurelia: unknown }).Aurelia = Aurelia;

export const IDOMInitializer = DI.createInterface<IDOMInitializer>('IDOMInitializer').noDefault();

export interface IDOMInitializer {
  initialize(config?: ISinglePageApp): IDOM;
}
