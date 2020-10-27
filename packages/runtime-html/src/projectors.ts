import { emptyArray, toArray, Metadata, DI } from '@aurelia/kernel';
import { convertToRenderLocation, INodeSequence } from './dom';
import { ICustomElementController } from './lifecycle';
import { CustomElement, CustomElementDefinition, CustomElementHost } from './resources/custom-element';
import { IShadowDOMStyles, IShadowDOMGlobalStyles } from './styles/shadow-dom-styles';

const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

export const IProjectorLocator = DI.createInterface<IProjectorLocator>('IProjectorLocator').withDefault(x => x.singleton(ProjectorLocator));
export interface IProjectorLocator extends ProjectorLocator {}

export class ProjectorLocator {
  public getElementProjector($component: ICustomElementController, host: CustomElementHost<HTMLElement>, def: CustomElementDefinition): ElementProjector {
    if (def.shadowOptions || def.hasSlots) {
      if (def.containerless) {
        throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
      }

      return new ShadowDOMProjector($component, host, def);
    }

    if (def.containerless) {
      return new ContainerlessProjector($component, host);
    }

    return new HostProjector($component, host, def.enhance);
  }
}

const childObserverOptions = { childList: true };

export type ElementProjector = ShadowDOMProjector | ContainerlessProjector | HostProjector;
export class ShadowDOMProjector {
  public shadowRoot: CustomElementHost<ShadowRoot>;

  public constructor(
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

  public subscribeToChildrenChange(callback: () => void, options: MutationObserverInit = childObserverOptions): void {
    // TODO: add a way to dispose/disconnect
    const obs = new this.host.ownerDocument!.defaultView!.MutationObserver(callback);
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

export class ContainerlessProjector {
  public host: CustomElementHost;

  private readonly childNodes: readonly ChildNode[];

  public constructor(
    $controller: ICustomElementController,
    host: Node,
  ) {
    if (host.childNodes.length) {
      this.childNodes = toArray(host.childNodes);
    } else {
      this.childNodes = emptyArray;
    }

    this.host = convertToRenderLocation(host) as CustomElementHost;
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

export class HostProjector {
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
