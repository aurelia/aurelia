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
  dom?: IDOM;
  host: THost;
  component: unknown;
}

export class Aurelia {
  private readonly container: IContainer;
  private isStarted: boolean;
  private startFlags: LifecycleFlags;
  private stopFlags: LifecycleFlags;
  private host: INode & {$au?: Aurelia | null} | null;
  private next: ICustomElement | null;
  private task: ILifecycleTask;
  private _root: ICustomElement | null;

  constructor(container: IContainer = DI.createContainer()) {
    this.container = container;
    this.isStarted = false;
    this.startFlags = LifecycleFlags.none;
    this.stopFlags = LifecycleFlags.none;
    this.host = null;
    this.next = null;
    this.task = LifecycleTask.done;
    this._root = null;

    Registration.instance(Aurelia, this).register(container);
  }

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): this {
    this.host = config.host as INode & {$au?: Aurelia | null};

    const domInitializer = this.container.get(IDOMInitializer);
    domInitializer.initialize(config);
    Registration.instance(INode, this.host).register(this.container);

    this.startFlags = LifecycleFlags.fromStartTask | config.strategy;
    this.stopFlags = LifecycleFlags.fromStopTask | config.strategy;

    let component: ICustomElement;
    const componentOrType = config.component as ICustomElement | ICustomElementType;
    if (CustomElementResource.isType(componentOrType as ICustomElementType)) {
      this.container.register(componentOrType as ICustomElementType);
      component = this.container.get<ICustomElement>(CustomElementResource.keyFrom((componentOrType as ICustomElementType).description.name));
    } else {
      component = componentOrType as ICustomElement;
    }
    this.next = ProxyObserver.getRawIfProxy(component);

    if (this.isStarted) {
      this.start();
    }

    return this;
  }

  public root(): ICustomElement | null {
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
    if (Profiler.enabled) { enterStart(); }

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

    if (Profiler.enabled) { leaveStart(); }

    return this.task;
  }

  public stop(): ILifecycleTask {
    if (this.isStarted && this._root !== null) {
      if (Profiler.enabled) { enterStop(); }

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

      if (Profiler.enabled) { leaveStop(); }
    }

    return this.task;
  }

  private onBeforeStart(): void {
    Reflect.set(this.host, '$au', this);
    this._root = this.next;
  }

  private onAfterStart(): void {
    this.isStarted = true;
  }

  private onBeforeStop(): void {
    this.isStarted = false;
  }

  private onAfterStop(): void {
    Reflect.deleteProperty(this._root.$host, '$au');
    this._root = null;
  }
}
(PLATFORM.global as typeof PLATFORM.global & {Aurelia: unknown}).Aurelia = Aurelia;

export const IDOMInitializer = DI.createInterface<IDOMInitializer>('IDOMInitializer').noDefault();

export interface IDOMInitializer {
  initialize(config?: ISinglePageApp): IDOM;
}
