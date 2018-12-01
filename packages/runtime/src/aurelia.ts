import { DI, IContainer, IRegistry, PLATFORM, Registration } from '../kernel';
import { INode } from './dom';
import { LifecycleFlags } from './observation';
import { CustomElementResource, ICustomElement, ICustomElementType } from './templating/custom-element';
import { IRenderingEngine } from './templating/lifecycle-render';
import { IBlessedNode } from './blessed-dom';
import * as blessed from 'blessed';
import { ILifecycle } from './lifecycle';

export interface ISinglePageApp {
  // host: INode;
  component: unknown;
  screen: blessed.Widgets.IScreenOptions
}

export class Aurelia {
  private container: IContainer;
  private components: ICustomElement[];
  private startTasks: (() => void)[];
  private stopTasks: (() => void)[];
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
    const host = this.createScreen(config) as blessed.Widgets.Screen & { $au: Aurelia };
    // const host = config.host as INode & {$au?: Aurelia | null};
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
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        const re = this.container.get(IRenderingEngine);
        component.$hydrate(re, host);
      }

      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      component.$attach(LifecycleFlags.fromStartTask, host);
      host.render();
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

  public createScreen(config: ISinglePageApp): blessed.Widgets.Screen {
    const lifecycle = this.container.get(ILifecycle);
    const screen = blessed.screen(config.screen);
    lifecycle['_flushCount'] = lifecycle['flushCount'];
    Reflect.defineProperty(lifecycle, 'flushCount', {
      get: function() { return this._flushCount; },
      set: function(value: any) {
        this._flushCount = value;
        screen.render();
      },
      configurable: true
    });
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
    return screen;
  }
}

(<{Aurelia: unknown}>PLATFORM.global).Aurelia = Aurelia;
