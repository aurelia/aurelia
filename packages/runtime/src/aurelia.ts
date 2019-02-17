import { DI, IContainer, IRegistry, PLATFORM, Profiler, Registration } from '@aurelia/kernel';
import { IActivator } from './activator';
import { IDOM, INode } from './dom';
import { BindingStrategy, LifecycleFlags } from './flags';
import { ContinuationTask, ILifecycleTask, LifecycleTask } from './lifecycle';
import { ProxyObserver } from './observation/proxy-observer';
import { CustomElementResource, ICustomElement, ICustomElementType } from './resources/custom-element';

const { enter: enterStart, leave: leaveStart } = Profiler.createTimer('Aurelia.start');
const { enter: enterStop, leave: leaveStop } = Profiler.createTimer('Aurelia.stop');

export interface ISinglePageApp<THost extends INode = INode> {
  strategy?: BindingStrategy;
  dom?: IDOM<THost>;
  host?: THost;
  component?: unknown;
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
  public get host(): TNode & {$au?: Aurelia<TNode> | null} | null {
    return this._host;
  }
  public get dom(): IDOM<TNode> {
    return this._dom;
  }
  private startFlags: LifecycleFlags;
  private stopFlags: LifecycleFlags;
  private next: ICustomElement<TNode> | null;
  private task: ILifecycleTask;
  private _host: TNode & {$au?: Aurelia<TNode> | null} | null;
  private _root: ICustomElement<TNode> | null;
  private _isRunning: boolean;
  private _isStarting: boolean;
  private _isStopping: boolean;
  private _dom: IDOM<TNode>;

  constructor(container: IContainer = DI.createContainer()) {
    this.container = container;
    this.startFlags = LifecycleFlags.none;
    this.stopFlags = LifecycleFlags.none;
    this.next = null;
    this.task = LifecycleTask.done;
    this._root = null;
    this._isRunning = false;
    this._isStarting = false;
    this._isStopping = false;
    this._host = null;
    this._dom = null;

    Registration.instance(Aurelia, this).register(container);
  }

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp<TNode>): this {
    // if no host provided but we already have one, we might just be switching component/strategy/dom
    // TODO: only switching host is not working yet (need to re-hydrate for that)
    this._host = (config.host as TNode & {$au?: Aurelia<TNode> | null}) || this._host;

    const domInitializer = this.container.get(IDOMInitializer);
    this._dom = domInitializer.initialize(config) as IDOM<TNode>;

    this.container.unregister(INode);
    Registration.instance(INode, this._host).register(this.container);

    this.startFlags = LifecycleFlags.fromStartTask | config.strategy;
    this.stopFlags = LifecycleFlags.fromStopTask | config.strategy;

    let component: ICustomElement<TNode>;
    const componentOrType = config.component as ICustomElement<TNode> | ICustomElementType<TNode>;
    if (!componentOrType) {
      // if no component provided but we already have one, we might just be switching host/strategy/dom
      if (this.next === null) {
        throw new Error(`A valid component must be provided, but received: ${componentOrType}`);
      } else {
        component = this.next;
      }
    } else if (CustomElementResource.isType(componentOrType as ICustomElementType<TNode>)) {
      this.container.register(componentOrType as ICustomElementType<TNode>);
      component = this.container.get<ICustomElement<TNode>>(CustomElementResource.keyFrom((componentOrType as ICustomElementType).description.name));
    } else if (CustomElementResource.isInstance(componentOrType)) {
      component = componentOrType;
    } else {
      throw new Error(`Invalid component. Must be a registered CustomElement class constructor or instance, but received: ${componentOrType.name || componentOrType.constructor.name}`);
    }
    this.next = ProxyObserver.getRawIfProxy(component);

    if (this.isRunning) {
      this.start();
    }

    return this;
  }

  public root(): ICustomElement<TNode> | null {
    if (this._root === null) {
      if (this.next === null) {
        return null;
      } else {
        return ProxyObserver.getProxyOrSelf(this.next);
      }
    }
    return ProxyObserver.getProxyOrSelf(this._root);
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
      this.task = activator.activate(this.host, this.next, this.container, this.startFlags, null);
    } else {
      this.task = new ContinuationTask(this.task, activator.activate, activator, this.host, this.next, this.container, this.startFlags, null);
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
        this.task = activator.deactivate(this._root, this.stopFlags);
      } else {
        this.task = new ContinuationTask(this.task, activator.deactivate, activator, this._root, this.stopFlags);
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
    Reflect.set(this.host, '$au', this);
    this._root = this.next;
    this._isStarting = true;
    if (Profiler.enabled) { enterStart(); }
  }

  private onAfterStart(): void {
    this._isRunning = true;
    this._isStarting = false;
    this.dispatchEvent('aurelia-composed', this._dom);
    this.dispatchEvent('au-started', this.host as unknown as Publisher);
    if (Profiler.enabled) { leaveStart(); }
  }

  private onBeforeStop(): void {
    this._isRunning = false;
    this._isStopping = true;
    if (Profiler.enabled) { enterStop(); }
  }

  private onAfterStop(): void {
    if (this._root !== null) {
      Reflect.deleteProperty(this._root.$host, '$au');
    }
    this._root = null;
    this._isStopping = false;
    this.dispatchEvent('au-stopped', this.host as unknown as Publisher);
    if (Profiler.enabled) { leaveStop(); }
  }

  private dispatchEvent(name: string, target: Publisher): void {
    target = 'dispatchEvent' in target ? target : this._dom;
    target.dispatchEvent(this._dom.createCustomEvent(name, { detail: this, bubbles: true, cancelable: true }));
  }
}
(PLATFORM.global as typeof PLATFORM.global & {Aurelia: unknown}).Aurelia = Aurelia;

export const IDOMInitializer = DI.createInterface<IDOMInitializer>('IDOMInitializer').noDefault();

export interface IDOMInitializer {
  initialize(config?: ISinglePageApp): IDOM;
}
