import { DI, IContainer, IRegistry, PLATFORM, Profiler, Registration } from '@aurelia/kernel';
import { IDOM, INode } from './dom';
import { LifecycleFlags } from './flags';
import { ProxyObserver } from './observation/proxy-observer';
import { ExposedContext } from './rendering-engine';
import { CustomElementResource, ICustomElement, ICustomElementType } from './resources/custom-element';

const { enter: enterStart, leave: leaveStart } = Profiler.createTimer('Aurelia.start');
const { enter: enterStop, leave: leaveStop } = Profiler.createTimer('Aurelia.stop');

export interface ISinglePageApp<THost extends INode = INode> {
  useProxies?: boolean;
  dom?: IDOM;
  host: THost;
  component: unknown;
}

export class Aurelia {
  private readonly container: IContainer;
  private readonly components: ICustomElement[];
  private readonly startTasks: (() => void)[];
  private readonly stopTasks: (() => void)[];
  private isStarted: boolean;
  private _root: ICustomElement | null;

  constructor(container: IContainer = DI.createContainer()) {
    this.container = container;
    this.components = [];
    this.startTasks = [];
    this.stopTasks = [];
    this.isStarted = false;
    this._root = null;

    Registration
      .instance(Aurelia, this)
      .register(container, Aurelia);
  }

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): this {
    const host = config.host as INode & {$au?: Aurelia | null};

    const domInitializer = this.container.get(IDOMInitializer);
    domInitializer.initialize(config);

    let startFlags = LifecycleFlags.fromStartTask;
    let stopFlags = LifecycleFlags.fromStopTask;
    if (config.useProxies) {
      startFlags |= LifecycleFlags.useProxies;
      stopFlags |= LifecycleFlags.useProxies;
    }
    let component: ICustomElement;
    const componentOrType = config.component as ICustomElement | ICustomElementType;
    if (CustomElementResource.isType(componentOrType as ICustomElementType)) {
      this.container.register(componentOrType as ICustomElementType);
      component = this.container.get<ICustomElement>(CustomElementResource.keyFrom((componentOrType as ICustomElementType).description.name));
    } else {
      component = componentOrType as ICustomElement;
    }
    component = ProxyObserver.getRawIfProxy(component);

    const startTask = () => {
      host.$au = this;
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        component.$hydrate(startFlags, this.container as ExposedContext, host);
      }

      component.$bind(startFlags | LifecycleFlags.fromBind, null);
      component.$attach(startFlags | LifecycleFlags.fromAttach);
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.$detach(stopFlags | LifecycleFlags.fromDetach);
      component.$unbind(stopFlags | LifecycleFlags.fromUnbind);
      host.$au = null;
    });

    if (this.isStarted) {
      startTask();
    }

    return this;
  }

  public root(): ICustomElement | null {
    return ProxyObserver.getProxyOrSelf(this._root);
  }

  public start(): this {
    if (Profiler.enabled) { enterStart(); }
    for (const runStartTask of this.startTasks) {
      runStartTask();
    }
    this.isStarted = true;
    if (Profiler.enabled) { leaveStart(); }
    return this;
  }

  public stop(): this {
    if (Profiler.enabled) { enterStop(); }
    this.isStarted = false;
    for (const runStopTask of this.stopTasks) {
      runStopTask();
    }
    if (Profiler.enabled) { leaveStop(); }
    return this;
  }
}
(PLATFORM.global as typeof PLATFORM.global & {Aurelia: unknown}).Aurelia = Aurelia;

export const IDOMInitializer = DI.createInterface<IDOMInitializer>('IDOMInitializer').noDefault();

export interface IDOMInitializer {
  initialize(config?: ISinglePageApp): IDOM;
}
