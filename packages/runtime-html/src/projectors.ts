import { PLATFORM, Reporter, Tracer } from '@aurelia/kernel';
import {
  CustomElementHost,
  ICustomElement,
  IDOM,
  IElementProjector,
  INodeSequence,
  IProjectorLocator,
  TemplateDefinition
} from '@aurelia/runtime';

const slice = Array.prototype.slice;

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

export class HTMLProjectorLocator implements IProjectorLocator<Node> {
  public getElementProjector(dom: IDOM<Node>, $component: ICustomElement<Node>, host: CustomElementHost<HTMLElement>, def: TemplateDefinition): IElementProjector<Node> {
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
export class ShadowDOMProjector implements IElementProjector<Node> {
  public host: CustomElementHost<Node>;
  public shadowRoot: CustomElementHost<ShadowRoot>;

  constructor($customElement: ICustomElement<Node>, host: CustomElementHost<HTMLElement>, definition: TemplateDefinition) {
    this.host = host;

    let shadowOptions: ShadowRootInit;
    if (definition.shadowOptions !== undefined) {
      shadowOptions = definition.shadowOptions as unknown as ShadowRootInit;
    } else {
      shadowOptions = defaultShadowOptions;
    }
    this.shadowRoot = host.attachShadow(shadowOptions);
    this.host.$customElement = $customElement;
    this.shadowRoot.$customElement = $customElement as ICustomElement<ShadowRoot>;
  }

  public get children(): ArrayLike<CustomElementHost<Node>> {
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

  public project(nodes: INodeSequence<Node>): void {
    if (Tracer.enabled) { Tracer.enter('ShadowDOMProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence<Node>): void {
    if (Tracer.enabled) { Tracer.enter('ShadowDOMProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class ContainerlessProjector implements IElementProjector<Node> {
  public host: CustomElementHost<Node>;

  private childNodes: ReadonlyArray<CustomElementHost<Node>>;

  constructor(dom: IDOM<Node>, $customElement: ICustomElement<Node>, host: Node) {
    if (host.childNodes.length) {
      this.childNodes = PLATFORM.toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = dom.convertToRenderLocation(host) as CustomElementHost<Node>;
    this.host.$customElement = $customElement;
  }

  public get children(): ArrayLike<CustomElementHost<Node>> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): Node {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence<Node>): void {
    if (Tracer.enabled) { Tracer.enter('ContainerlessProjector.project', slice.call(arguments)); }
    nodes.insertBefore(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence<Node>): void {
    if (Tracer.enabled) { Tracer.enter('ContainerlessProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class HostProjector implements IElementProjector<Node> {
  public host: CustomElementHost<Node>;

  constructor($customElement: ICustomElement<Node>, host: CustomElementHost<Node>) {
    this.host = host;
    this.host.$customElement = $customElement;
  }

  public get children(): ArrayLike<CustomElementHost<Node>> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): Node {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence<Node>): void {
    if (Tracer.enabled) { Tracer.enter('HostProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence<Node>): void {
    if (Tracer.enabled) { Tracer.enter('HostProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
