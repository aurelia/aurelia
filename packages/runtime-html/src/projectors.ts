import { IContainer, IResolver, emptyArray, Registration, toArray, Metadata } from '@aurelia/kernel';
import { HTMLDOM, INodeSequence } from './dom';
import { ICustomElementController } from './lifecycle';
import { CustomElement, CustomElementDefinition, CustomElementHost, IElementProjector, IProjectorLocator } from './resources/custom-element';
import { IShadowDOMStyles, IShadowDOMGlobalStyles } from './styles/shadow-dom-styles';

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

export class HTMLProjectorLocator implements IProjectorLocator {
  public static register(container: IContainer): IResolver<IProjectorLocator> {
    return Registration.singleton(IProjectorLocator, this).register(container);
  }

  public getElementProjector(dom: HTMLDOM, $component: ICustomElementController, host: CustomElementHost<HTMLElement>, def: CustomElementDefinition): IElementProjector {
    if (def.shadowOptions || def.hasSlots) {
      if (def.containerless) {
        throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
      }

      return new ShadowDOMProjector(dom, $component, host, def);
    }

    if (def.containerless) {
      return new ContainerlessProjector(dom, $component, host);
    }

    return new HostProjector($component, host, def.enhance);
  }
}

const childObserverOptions = { childList: true };

/** @internal */
export class ShadowDOMProjector implements IElementProjector {
  public shadowRoot: CustomElementHost<ShadowRoot>;

  public constructor(
    public dom: HTMLDOM,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly
    private $controller: ICustomElementController,
    public host: CustomElementHost<HTMLElement>,
    definition: CustomElementDefinition,
  ) {
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
    Metadata.define(CustomElement.name, $controller, this.host);
    Metadata.define(CustomElement.name, $controller, this.shadowRoot);
  }

  public get children(): ArrayLike<ChildNode> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void, options = childObserverOptions): void {
    // TODO: add a way to dispose/disconnect
    const obs = new this.dom.window.MutationObserver(callback);
    obs.observe(this.host, options);
  }

  public provideEncapsulationSource(): CustomElementHost<ShadowRoot> {
    return this.shadowRoot;
  }

  public project(nodes: INodeSequence): void {
    const context = this.$controller.context!;
    const styles = context.has(IShadowDOMStyles, false)
      ? context.get(IShadowDOMStyles)
      : context.get(IShadowDOMGlobalStyles);

    styles.applyTo(this.shadowRoot);
    nodes.appendTo(this.shadowRoot);
  }

  public take(nodes: INodeSequence): void {
    nodes.remove();
    nodes.unlink();
  }
}

/** @internal */
export class ContainerlessProjector implements IElementProjector {
  public host: CustomElementHost;

  private readonly childNodes: readonly ChildNode[];

  public constructor(
    dom: HTMLDOM,
    $controller: ICustomElementController,
    host: Node,
  ) {
    if (host.childNodes.length) {
      this.childNodes = toArray(host.childNodes);
    } else {
      this.childNodes = emptyArray;
    }

    this.host = dom.convertToRenderLocation(host) as CustomElementHost;
    Metadata.define(CustomElement.name, $controller, this.host);
  }

  public get children(): ArrayLike<ChildNode> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // TODO: turn this into an error
    // Containerless does not have a container node to observe children on.
  }

  public provideEncapsulationSource(): Node {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence): void {
    nodes.insertBefore(this.host);
  }

  public take(nodes: INodeSequence): void {
    nodes.remove();
    nodes.unlink();
  }
}

/** @internal */
export class HostProjector implements IElementProjector {
  public constructor(
    $controller: ICustomElementController,
    public host: CustomElementHost,
    private readonly enhance: boolean,
  ) {
    Metadata.define(CustomElement.name, $controller, host);
  }

  public get children(): ArrayLike<ChildNode> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(): Node {
    return this.host.getRootNode();
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host, this.enhance);
  }

  public take(nodes: INodeSequence): void {
    nodes.remove();
    nodes.unlink();
  }
}
