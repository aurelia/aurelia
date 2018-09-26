import { DI, IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { BindingFlags } from './binding/binding-flags';
import { Lifecycle, LifecycleFlags } from './templating';
import { ICustomElement } from './templating/custom-element';
import { IRenderingEngine } from './templating/rendering-engine';

export interface ISinglePageApp {
  host: any,
  component: any
}

export class Aurelia {
  private components: ICustomElement[] = [];
  private startTasks: (() => void)[] = [];
  private stopTasks: (() => void)[] = [];
  private isStarted = false;
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

    const startTask = () => {
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        component.$hydrate(
          this.container.get(IRenderingEngine),
          config.host
        );
      }

      component.$bind(BindingFlags.fromStartTask | BindingFlags.fromBind);

      Lifecycle.beginAttach(config.host, LifecycleFlags.none)
        .attach(component)
        .end();
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      const task = Lifecycle.beginDetach(LifecycleFlags.noTasks)
        .detach(component)
        .end();

      const flags = BindingFlags.fromStopTask | BindingFlags.fromUnbind;

      if (task.done) {
        component.$unbind(flags);
      } else {
        task.wait().then(() => component.$unbind(flags));
      }
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
    this.startTasks.forEach(x => x());
    this.isStarted = true;
    return this;
  }

  public stop(): this {
    this.isStarted = false;
    this.stopTasks.forEach(x => x());
    return this;
  }
}

(<any>PLATFORM.global).Aurelia = Aurelia;
