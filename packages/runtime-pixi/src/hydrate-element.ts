import { Scope, ICustomElement, IRenderingEngine, INode, IElementHydrationOptions, ICustomElementType, ICustomElementHost, TemplateDefinition, IElementProjector, INodeSequence, State, DOM, Hooks } from '@aurelia/runtime';
import { Writable, PLATFORM, Reporter } from '@aurelia/kernel';

/*@internal*/
export function $hydrateElement(this: Writable<ICustomElement>, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$scope = Scope.create(this, null);
  this.$host = host;
  this.$projector = determineProjector(this, host, description);

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasRender) {
    const result = this.render(host, options.parts);

    if (result && 'getElementTemplate' in result) {
      const template = result.getElementTemplate(renderingEngine, Type);
      template.render(this, host, options.parts);
    }
  } else {
    const template = renderingEngine.getElementTemplate(description, Type);
    template.render(this, host, options.parts);
  }

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
}


/*@internal*/
export const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

function determineProjector(
  $customElement: ICustomElement,
  host: ICustomElementHost,
  definition: TemplateDefinition
): IElementProjector {
  if (definition.shadowOptions || definition.hasSlots) {
    if (definition.containerless) {
      throw Reporter.error(21);
    }

    return new ShadowDOMProjector($customElement, host, definition);
  }

  if (definition.containerless) {
    return new ContainerlessProjector($customElement, host);
  }

  return new HostProjector($customElement, host);
}


const childObserverOptions = { childList: true };

/*@internal*/
export class ShadowDOMProjector implements IElementProjector {
  public shadowRoot: ICustomElementHost;

  constructor(
    $customElement: ICustomElement,
    public host: ICustomElementHost,
    definition: TemplateDefinition
  ) {
    this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
    host.$customElement = $customElement;
    this.shadowRoot.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    DOM.createNodeObserver(this.host, callback, childObserverOptions);
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return this.shadowRoot;
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host);
    this.project = PLATFORM.noop;
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are in
    // the ShadowDOM.
  }
}

/*@internal*/
export class ContainerlessProjector implements IElementProjector {
  public host: ICustomElementHost;
  private childNodes: ArrayLike<INode>;

  constructor(private $customElement: ICustomElement, host: ICustomElementHost) {
    if (host.childNodes.length) {
      this.childNodes = PLATFORM.toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = DOM.convertToRenderLocation(host);
    this.host.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    if (!parentEncapsulationSource) {
      throw Reporter.error(22);
    }

    return parentEncapsulationSource;
  }

  public project(nodes: INodeSequence): void {
    if (this.$customElement.$state & State.needsMount) {
      this.$customElement.$state &= ~State.needsMount;
      nodes.insertBefore(this.host);
    }
  }

  public take(nodes: INodeSequence): void {
    this.$customElement.$state |= State.needsMount;
    nodes.remove();
  }
}

/*@internal*/
export class HostProjector implements IElementProjector {
  private readonly isAppHost: boolean;
  constructor($customElement: ICustomElement, public host: ICustomElementHost) {
    host.$customElement = $customElement;
    this.isAppHost = host.hasOwnProperty('$au');
  }

  get children(): ArrayLike<INode> {
    return PLATFORM.emptyArray;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return parentEncapsulationSource || this.host;
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host);
    if (!this.isAppHost) {
      this.project = PLATFORM.noop;
    }
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are children.
    if (this.isAppHost) {
      // The only exception to that is the app host, which is not part of a removable node sequence
      nodes.remove();
    }
  }
}
