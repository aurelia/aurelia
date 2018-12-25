import { PLATFORM, Reporter, Tracer } from '@aurelia/kernel';
import {
  CustomElementHost,
  ICustomElement,
  IDOM,
  IElementProjector,
  INode,
  INodeSequence,
  IProjectorLocator,
  IRenderLocation,
  TemplateDefinition
} from '@aurelia/runtime';

const slice = Array.prototype.slice;

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

export class HTMLProjectorLocator implements IProjectorLocator {
  public getElementProjector(dom: IDOM, $component: ICustomElement, host: CustomElementHost<HTMLElement>, def: TemplateDefinition): IElementProjector {
    if (def.shadowOptions || def.hasSlots) {
      if (def.containerless) {
        throw Reporter.error(21);
      }

      return new ShadowDOMProjector($component, host, def);
    }

    if (def.containerless) {
      return new ContainerlessProjector(dom, $component, host);
    }

    return new HostProjector($component, host);
  }
}

const childObserverOptions = { childList: true };

/** @internal */
export class ShadowDOMProjector implements IElementProjector {
  public host: CustomElementHost<HTMLElement>;
  public shadowRoot: CustomElementHost<ShadowRoot>;

  constructor($customElement: ICustomElement, host: CustomElementHost<HTMLElement>, definition: TemplateDefinition) {
    this.host = host;

    let shadowOptions: ShadowRootInit;
    if (definition.shadowOptions !== undefined) {
      shadowOptions = definition.shadowOptions as unknown as ShadowRootInit;
    } else {
      shadowOptions = defaultShadowOptions;
    }
    this.shadowRoot = host.attachShadow(shadowOptions);
    this.host.$customElement = $customElement;
    this.shadowRoot.$customElement = $customElement;
  }

  public get children(): ArrayLike<CustomElementHost> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // TODO: add a way to dispose/disconnect
    const observer = new MutationObserver(callback);
    observer.observe(this.host, childObserverOptions);
  }

  public provideEncapsulationSource(): CustomElementHost<ShadowRoot> {
    return this.shadowRoot;
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ShadowDOMProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ShadowDOMProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class ContainerlessProjector implements IElementProjector {
  public host: IRenderLocation & CustomElementHost<Comment>;

  private childNodes: ReadonlyArray<CustomElementHost>;

  constructor(dom: IDOM, $customElement: ICustomElement, host: CustomElementHost<HTMLElement>) {
    if (host.childNodes.length) {
      this.childNodes = PLATFORM.toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = dom.convertToRenderLocation(host) as IRenderLocation & CustomElementHost<Comment>;
    this.host.$customElement = $customElement;
  }

  public get children(): ArrayLike<CustomElementHost> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): INode {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ContainerlessProjector.project', slice.call(arguments)); }
    nodes.insertBefore(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ContainerlessProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class HostProjector implements IElementProjector {
  public host: CustomElementHost<HTMLElement>;

  constructor($customElement: ICustomElement, host: CustomElementHost<HTMLElement>) {
    this.host = host;
    this.host.$customElement = $customElement;
  }

  public get children(): ArrayLike<CustomElementHost> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): INode {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('HostProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('HostProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
