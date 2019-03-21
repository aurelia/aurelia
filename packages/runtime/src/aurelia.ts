import {
  DI,
  IContainer,
  IRegistry,
  PLATFORM,
  Profiler,
  Registration
} from '@aurelia/kernel';

import { IActivator } from './activator';
import {
  IDOM,
  INode
} from './dom';
import {
  BindingStrategy,
  LifecycleFlags
} from './flags';
import {
  ContinuationTask,
  IController,
  ILifecycle,
  ILifecycleHooks,
  ILifecycleTask,
  LifecycleTask,
} from './lifecycle';
import { ExposedContext } from './rendering-engine';
import {
  CustomElementResource,
  ICustomElementType
} from './resources/custom-element';
import { Controller } from './templating/controller';

const { enter: enterStart, leave: leaveStart } = Profiler.createTimer('Aurelia.start');
const { enter: enterStop, leave: leaveStop } = Profiler.createTimer('Aurelia.stop');

export interface ISinglePageApp<THost extends INode = INode> {
  strategy?: BindingStrategy;
  dom?: IDOM;
  host: THost;
  component: unknown;
}

type Publisher = { dispatchEvent(evt: unknown, options?: unknown): void };

export class Aurelia<TNode extends INode = INode> {
  public readonly container: IContainer;
  public get isRunning(): boolean {
    return this._isRunning;
  }
  public get isStarting(): boolean {
    return this._isStarting;
  }
  public get isStopping(): boolean {
    return this._isStopping;
  }
  public get root(): IController {
    if (this._root == void 0) {
      throw new Error(`root is not defined`); // TODO: create error code
    }
    return this._root;
  }
  public get host(): TNode & {$au?: Aurelia<TNode>} {
    if (this._host == void 0) {
      throw new Error(`root is not defined`); // TODO: create error code
    }
    return this._host;
  }
  public get dom(): IDOM<TNode> {
    if (this._dom == void 0) {
      throw new Error(`root is not defined`); // TODO: create error code
    }
    return this._dom;
  }
  private startFlags: LifecycleFlags;
  private stopFlags: LifecycleFlags;
  private task: ILifecycleTask;
  private _isRunning: boolean;
  private _isStarting: boolean;
  private _isStopping: boolean;
  private _root?: IController;
  private _host?: TNode & {$au?: Aurelia<TNode> };
  private _dom?: IDOM<TNode>;

  private next?: IController;

  constructor(container: IContainer = DI.createContainer()) {
    this.container = container;
    this.startFlags = LifecycleFlags.none;
    this.stopFlags = LifecycleFlags.none;
    this.task = LifecycleTask.done;

    this._isRunning = false;
    this._isStarting = false;
    this._isStopping = false;

    this._root = void 0;
    this._host = void 0;
    this._dom = void 0;

    this.next = void 0;

    Registration.instance(Aurelia, this).register(container);
  }

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): this {
    // if no host provided but we already have one, we might just be switching component/strategy/dom
    // TODO: only switching host is not working yet (need to re-hydrate for that)
    this._host = (config.host as TNode & {$au?: Aurelia<TNode>}) || this._host;

    const domInitializer = this.container.get(IDOMInitializer);
    this._dom = domInitializer.initialize(config) as IDOM<TNode>;

    Registration.instance(INode, this._host).register(this.container);

    this.startFlags = LifecycleFlags.fromStartTask | config.strategy!;
    this.stopFlags = LifecycleFlags.fromStopTask | config.strategy!;

    let controller: IController;
    const componentOrType = config.component as ILifecycleHooks | ICustomElementType;
    if (CustomElementResource.isType(componentOrType as ICustomElementType)) {
      this.container.register(componentOrType as ICustomElementType);
      const component = this.container.get<ILifecycleHooks>(CustomElementResource.keyFrom((componentOrType as ICustomElementType).description.name));
      controller = Controller.forCustomElement(component, this.container as ExposedContext, this.host, this.startFlags);
    } else {
      controller = Controller.forCustomElement(componentOrType as ILifecycleHooks, this.container as ExposedContext, this.host, this.startFlags);
    }

    this.next = controller;

    if (this.isRunning) {
      this.start();
    }

    return this;
  }

  public start(): ILifecycleTask {
    this.stop();

    if (this.task.done) {
      this.onBeforeStart();
    } else {
      this.task = new ContinuationTask(this.task, this.onBeforeStart, this);
    }

    const activator = this.container.get(IActivator);
    if (this.task.done) {
      this.task = activator.activate(this.host, this.next!.viewModel!, this.container, this.startFlags, void 0);
    } else {
      this.task = new ContinuationTask(this.task, activator.activate, activator, this.host, this.next!.viewModel!, this.container, this.startFlags, void 0);
    }

    if (this.task.done) {
      this.onAfterStart();
    } else {
      this.task = new ContinuationTask(this.task, this.onAfterStart, this);
    }

    return this.task;
  }

  public stop(): ILifecycleTask {
    if ((this.isRunning && this._root !== null) || !this.task.done) {
      if (this.task.done) {
        this.onBeforeStop();
      } else {
        this.task = new ContinuationTask(this.task, this.onBeforeStop, this);
      }

      const activator = this.container.get(IActivator);
      if (this.task.done) {
        this.task = activator.deactivate(this.root.viewModel!, this.stopFlags);
      } else {
        this.task = new ContinuationTask(this.task, activator.deactivate, activator, this.root.viewModel!, this.stopFlags);
      }

      if (this.task.done) {
        this.onAfterStop();
      } else {
        this.task = new ContinuationTask(this.task, this.onAfterStop, this);
      }
    }

    return this.task;
  }

  public wait(): Promise<void> {
    return this.task.wait() as Promise<void>;
  }

  private onBeforeStart(): void {
    this.container.get(ILifecycle).startTicking(PLATFORM.ticker);
    Reflect.set(this.host, '$au', this);
    this._root = this.next;
    this._isStarting = true;
    if (Profiler.enabled) { enterStart(); }
  }

  private onAfterStart(): void {
    this._isRunning = true;
    this._isStarting = false;
    this.dispatchEvent('aurelia-composed', this.dom);
    this.dispatchEvent('au-started', this.host as unknown as Publisher);
    if (Profiler.enabled) { leaveStart(); }
  }

  private onBeforeStop(): void {
    this._isRunning = false;
    this._isStopping = true;
    if (Profiler.enabled) { enterStop(); }
  }

  private onAfterStop(): void {
    if (this._root != void 0) {
      Reflect.deleteProperty(this.root.host!, '$au');
    }
    this._root = void 0;
    this._isStopping = false;
    this.dispatchEvent('au-stopped', this.host as unknown as Publisher);
    this.container.get(ILifecycle).stopTicking();
    if (Profiler.enabled) { leaveStop(); }
  }

  private dispatchEvent(name: string, target: Publisher): void {
    target = 'dispatchEvent' in target ? target : this.dom;
    target.dispatchEvent(this.dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
  }
}
(PLATFORM.global as typeof PLATFORM.global & {Aurelia: unknown}).Aurelia = Aurelia;

export const IDOMInitializer = DI.createInterface<IDOMInitializer>('IDOMInitializer').noDefault();

export interface IDOMInitializer {
  initialize(config?: ISinglePageApp): IDOM;
}
