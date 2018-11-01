import { DI, IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { Lifecycle } from './lifecycle';
import { BindingFlags, IChangeSet } from './observation';
import { ICustomElement } from './templating/custom-element';
import { IRenderingEngine } from './templating/rendering-engine';

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

      component.$bind(BindingFlags.fromStartTask | BindingFlags.fromBind);

      const cs = this.container.get(IChangeSet);
      const lifecycle = Lifecycle.beginAttach(cs, config.host);
      lifecycle.attach(component);
      lifecycle.endAttach();
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      const cs = this.container.get(IChangeSet);
      const lifecycle = Lifecycle.beginDetach(cs);
      lifecycle.detach(component);
      lifecycle.endDetach();

      const flags = BindingFlags.fromStopTask | BindingFlags.fromUnbind;

      component.$unbind(flags);
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
