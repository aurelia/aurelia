import { DI, IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { LifecycleFlags } from './observation';
import { ICustomElement, IRenderingEngine } from './templating//lifecycle-render';

export interface ISinglePageApp {
  host: any,
  component: any;
}

export class Aurelia {
  private components: ICustomElement[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];
  private isStarted: boolean = false;
  private _root: ICustomElement = null;

  constructor(private container: IContainer = DI.createContainer()) {
    Registration
      .instance(Aurelia, this)
      .register(container, Aurelia);
  }

  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    this.container.register(...params);
    return this;
  }

  public app(config: ISinglePageApp): this {
    const component: ICustomElement = config.component;
    const host = config.host;

    const startTask = () => {
      host.$au = this;
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        const re = this.container.get(IRenderingEngine);
        component.$hydrate(re, host);
      }

      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      component.$attach(LifecycleFlags.fromStartTask);
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.$detach(LifecycleFlags.fromStopTask);
      component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
      host.$au = null;
    });

    if (this.isStarted) {
      startTask();
    }

    return this;
  }

  public root(): ICustomElement | null {
    return this._root;
  }

  public start(): this {
    for (const runStartTask of this.startTasks) {
      runStartTask();
    }
    this.isStarted = true;
    return this;
  }

  public stop(): this {
    this.isStarted = false;
    for (const runStopTask of this.stopTasks) {
      runStopTask();
    }
    return this;
  }
}

(<any>PLATFORM.global).Aurelia = Aurelia;
