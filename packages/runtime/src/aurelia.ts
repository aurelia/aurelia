import { DI, IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { DOM, IDOM } from './dom';
import { IDocument, INode } from './dom.interfaces';
import { LifecycleFlags } from './observation';
import { CustomElementResource, ICustomElement, ICustomElementType } from './resources/custom-element';
import { IRenderingEngine } from './templating/lifecycle-render';

declare var document: IDocument;

export interface ISinglePageApp {
  dom?: IDOM;
  host: unknown;
  component: unknown;
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
    const host = config.host as INode & {$au?: Aurelia | null};
    let component: ICustomElement;
    const componentOrType = config.component as ICustomElement | ICustomElementType;
    if (CustomElementResource.isType(componentOrType as ICustomElementType)) {
      this.container.register(componentOrType as ICustomElementType);
      component = this.container.get<ICustomElement>(CustomElementResource.keyFrom((componentOrType as ICustomElementType).description.name));
    } else {
      component = componentOrType as ICustomElement;
    }
    if (!this.container.has(IDOM, false)) {
      if (config.dom !== undefined) {
        this.useDOM(config.dom);
      } else if (host.ownerDocument !== null) {
        this.useDOM(host.ownerDocument);
      } else {
        this.useDOM();
      }
    }

    const startTask = () => {
      host.$au = this;
      if (!this.components.includes(component)) {
        this._root = component;
        this.components.push(component);
        const dom = this.container.get(IDOM);
        const re = this.container.get(IRenderingEngine);
        component.$hydrate(dom, re, host);
      }

      component.$bind(LifecycleFlags.fromStartTask | LifecycleFlags.fromBind, null);
      component.$attach(LifecycleFlags.fromStartTask | LifecycleFlags.fromAttach, host);
    };

    this.startTasks.push(startTask);

    this.stopTasks.push(() => {
      component.$detach(LifecycleFlags.fromStopTask | LifecycleFlags.fromDetach);
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

  /**
   * Use the supplied `dom` directly for this `Aurelia` instance.
   */
  public useDOM(dom: IDOM): this;
  /**
   * Create a new HTML `DOM` backed by the supplied `document`.
   */
  public useDOM(document: IDocument): this;
  /**
   * Either create a new HTML `DOM` backed by the supplied `document` or uses the supplied `DOM` directly.
   *
   * If no argument is provided, uses the default global `document` variable.
   * (this will throw an error in non-browser environments).
   */
  public useDOM(domOrDocument?: IDOM | IDocument): this;
  public useDOM(domOrDocument?: IDOM | IDocument): this {
    let dom: IDOM;
    if (domOrDocument === undefined) {
      dom = new DOM(document);
    } else if (quacksLikeDOM(domOrDocument)) {
      dom = domOrDocument;
    } else {
      dom = new DOM(domOrDocument);
    }
    Registration
      .instance(IDOM, dom)
      .register(this.container, IDOM);
    return this;
  }
}

function quacksLikeDOM(potentialDOM: unknown): potentialDOM is IDOM {
  return 'convertToRenderLocation' in (potentialDOM as object);
}

(PLATFORM.global as {Aurelia: unknown}).Aurelia = Aurelia;
