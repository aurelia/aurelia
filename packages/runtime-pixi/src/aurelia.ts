import { DI, IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags } from './observation';
import { CustomElementResource, ICustomElement, ICustomElementType } from './templating/custom-element';
import { IRenderingEngine } from './templating/lifecycle-render';

export interface ISinglePageApp {
  host: INode;
  component: unknown;
  pixi: PIXI.ApplicationOptions;
}

export class Aurelia {
  private container: IContainer;
  private components: ICustomElement[];
  private startTasks: (() => void)[];
  private stopTasks: (() => void)[];
  private isStarted: boolean;
  private _root: ICustomElement | null;
  private pixi: PIXI.Application;

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
    const pixiApp = this.pixi = this.createApplication(config.pixi);
    const host = config.host as INode & {$au?: Aurelia | null};
    let component: ICustomElement;
    const componentOrType = config.component as ICustomElement | ICustomElementType;
    if (CustomElementResource.isType(<ICustomElementType>componentOrType)) {
      this.container.register(<ICustomElementType>componentOrType);
      component = this.container.get<ICustomElement>(CustomElementResource.keyFrom((<ICustomElementType>componentOrType).description.name));
    } else {
      component = <ICustomElement>componentOrType;
    }

    const startTask = () => {
      host.$au = this;
      (host as any).appendChild(pixiApp.view);
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        const re = this.container.get(IRenderingEngine);
        component.$hydrate(re, pixiApp.stage);
      }

      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      component.$attach(LifecycleFlags.fromStartTask, host);
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

  private createApplication(options: PIXI.ApplicationOptions = {}) {
    return new PIXI.Application({
      width: 512,
      height: 512,
      antialias: true,
      transparent: false,
      resolution: 1,
      ...options
    });
  }
}

(<{Aurelia: unknown}>PLATFORM.global).Aurelia = Aurelia;
