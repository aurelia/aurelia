import {
  IContainer,
  IResolver,
  PLATFORM,
  Registration,
  Reporter,
  toArray
} from '@aurelia/kernel';
import {
  CustomElementHost,
  IController,
  IDOM,
  IElementProjector,
  INodeSequence,
  IProjectorLocator,
  CustomElementDefinition
} from '@aurelia/runtime';
import { IShadowDOMStyles, IShadowDOMGlobalStyles } from './styles/shadow-dom-styles';

const slice = Array.prototype.slice;

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

export class HTMLProjectorLocator implements IProjectorLocator<Node> {
  public static register(container: IContainer): IResolver<IProjectorLocator> {
    return Registration.singleton(IProjectorLocator, this).register(container);
  }

  public getElementProjector(dom: IDOM<Node>, $component: IController<Node>, host: CustomElementHost<HTMLElement>, def: CustomElementDefinition): IElementProjector<Node> {
    if (def.shadowOptions || def.hasSlots) {
      if (def.containerless) {
        throw Reporter.error(21);
      }

      return new ShadowDOMProjector(dom, $component, host, def);
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
  public dom: IDOM<Node>;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private $controller: IController<Node>;

  public constructor(dom: IDOM<Node>, $controller: IController<Node>, host: CustomElementHost<HTMLElement>, definition: CustomElementDefinition) {
    this.dom = dom;
    this.host = host;
    this.$controller = $controller;

    let shadowOptions: ShadowRootInit;
    if (
      definition.shadowOptions instanceof Object &&
      'mode' in definition.shadowOptions
    ) {
      shadowOptions = definition.shadowOptions as unknown as ShadowRootInit;
    } else {
      shadowOptions = defaultShadowOptions;
    }
    this.shadowRoot = host.attachShadow(shadowOptions);
    this.host.$controller = $controller;
    this.shadowRoot.$controller = $controller as IController<ShadowRoot>;
  }

  public get children(): ArrayLike<CustomElementHost<Node>> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void, options = childObserverOptions): void {
    // TODO: add a way to dispose/disconnect
    this.dom.createNodeObserver!(this.host, callback, options);
  }

  public provideEncapsulationSource(): CustomElementHost<ShadowRoot> {
    return this.shadowRoot;
  }

  public project(nodes: INodeSequence<Node>): void {
    const context = this.$controller.context!;
    const styles = context.has(IShadowDOMStyles, false)
      ? context.get(IShadowDOMStyles)
      : context.get(IShadowDOMGlobalStyles);

    styles.applyTo(this.shadowRoot);
    nodes.appendTo(this.shadowRoot);
  }

  public take(nodes: INodeSequence<Node>): void {
    nodes.remove();
    nodes.unlink();
  }
}

/** @internal */
export class ContainerlessProjector implements IElementProjector<Node> {
  public host: CustomElementHost<Node>;

  private readonly childNodes: readonly CustomElementHost<Node>[];

  public constructor(dom: IDOM<Node>, $controller: IController<Node>, host: Node) {
    if (host.childNodes.length) {
      this.childNodes = toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = dom.convertToRenderLocation(host) as CustomElementHost<Node>;
    this.host.$controller = $controller;
  }

  public get children(): ArrayLike<CustomElementHost<Node>> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // TODO: turn this into an error
    // Containerless does not have a container node to observe children on.
  }

  public provideEncapsulationSource(): Node {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence<Node>): void {
    nodes.insertBefore(this.host);
  }

  public take(nodes: INodeSequence<Node>): void {
    nodes.remove();
    nodes.unlink();
  }
}

/** @internal */
export class HostProjector implements IElementProjector<Node> {
  public host: CustomElementHost<Node>;

  public constructor($controller: IController<Node>, host: CustomElementHost<Node>) {
    this.host = host;
    this.host.$controller = $controller;
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
    nodes.appendTo(this.host);
  }

  public take(nodes: INodeSequence<Node>): void {
    nodes.remove();
    nodes.unlink();
  }
}
