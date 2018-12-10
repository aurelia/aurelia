import 'reflect-metadata';
import { DI, IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { INode } from './dom';
import './ns-dom-map';
import { NsDOM, INsNode } from './ns-dom';
import { LifecycleFlags } from './observation';
import { CustomElementResource, ICustomElement, ICustomElementType } from './templating/custom-element';
import { IRenderingEngine } from './templating/lifecycle-render';
import { Page } from 'tns-core-modules/ui/page/page';
import { init } from '../../basichtml';
import { Frame } from 'tns-core-modules/ui/frame/frame';
import * as NsApplication from 'tns-core-modules/application';

// import { Aurelia } from './@aurelia/runtime';

// new Aurelia()
//   .register()
//   .app({
//     host: new Page() as any,
//     component: class {}
//   })
//   .start();

// application.run({ moduleName: "app-root" });

init({
  window: global as any
});

export interface INsConfig {
  /**
   * Root frame of NS application
   */
  root?: Frame;
}

export interface ISinglePageApp {
  // host: Frame;
  component: unknown;
}

export class Aurelia {
  private container: IContainer;
  private components: ICustomElement[];
  private startTasks: (() => void)[];
  private stopTasks: (() => void)[];
  private isStarted: boolean;
  private _root: ICustomElement | null;
  private page: Page;

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
    const root = this.initNativeScript(config) as Page & { $au?: Aurelia | null };
    // const host = config.host as INode & {$au?: Aurelia | null};
    let component: ICustomElement;
    const componentOrType = config.component as ICustomElement | ICustomElementType;
    if (CustomElementResource.isType(componentOrType as ICustomElementType)) {
      this.container.register(componentOrType as ICustomElementType);
      component = this.container.get<ICustomElement>(CustomElementResource.keyFrom((componentOrType as ICustomElementType).description.name));
    } else {
      component = componentOrType as ICustomElement;
    }

    const startTask = () => {
      root.$au = this;
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        const re = this.container.get(IRenderingEngine);
        component.$hydrate(re, root);
      }

      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind);
      component.$attach(LifecycleFlags.fromStartTask, root);

      NsApplication.run({
        create: () => {
          return root;
          // let firstChild: INsNode;
          // root.eachChildView((view) => (firstChild = view as INsNode, false));
          // if (!firstChild) {
          //   throw new Error('Failed to init application. No page found');
          // }
          // return firstChild;
        }
      });
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.$detach(LifecycleFlags.fromStopTask);
      component.$unbind(LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind);
      root.$au = null;
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

  private initNativeScript(config: ISinglePageApp) {
    // config.host = config.host || NsDOM.createElement('Frame');
    // return config.host;
    return NsDOM.createElement('Page');
  }
}

(PLATFORM.global as {Aurelia: unknown}).Aurelia = Aurelia;
