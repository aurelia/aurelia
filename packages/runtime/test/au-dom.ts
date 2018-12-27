import {
  DI,
  IContainer,
  inject,
  IRegistry,
  IResolver,
  PLATFORM,
  Registration,
  Tracer
} from '@aurelia/kernel';
import {
  parseExpression
} from '../../jit/src/index';
import {
  addBindable,
  Aurelia,
  Binding,
  BindingMode,
  BindingType,
  CompiledTemplate,
  CustomElementHost,
  HydrateElementInstruction,
  HydrateTemplateController,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICustomElement,
  IDOM,
  IDOMInitializer,
  IElementProjector,
  IInstructionRenderer,
  ILifecycle,
  INode,
  INodeSequence,
  INodeSequenceFactory,
  instructionRenderer,
  IObserverLocator,
  IProjectorLocator,
  IRenderable,
  IRenderContext,
  IsBindingBehavior,
  ISinglePageApp,
  ITargetAccessorLocator,
  ITargetedInstruction,
  ITargetObserverLocator,
  ITemplate,
  ITemplateDefinition,
  ITemplateFactory,
  IteratorBindingInstruction,
  LetBindingInstruction,
  LetElementInstruction,
  RuntimeConfiguration,
  TemplateDefinition,
  ToViewBindingInstruction
} from '../src/index';

const slice = Array.prototype.slice;

export class AuNode implements INode {
  public readonly nodeName: string;
  public readonly isWrapper: boolean;
  public readonly isMarker: boolean;
  public readonly isRenderLocation: boolean;
  public $start: AuNode | null;
  public $nodes: INodeSequence<AuNode> | Readonly<{}> | null;
  public isTarget: boolean;
  public get isConnected(): boolean {
    return this._isConnected;
  }
  public set isConnected(value: boolean) {
    if (this._isConnected !== value) {
      this._isConnected = value;
      let current = this.firstChild;
      while (current !== null) {
        current.isConnected = value;
        current = current.nextSibling;
      }
    }
  }
  public isMounted: boolean;
  public parentNode: AuNode | null;
  public childNodes: AuNode[];
  public get textContent(): string {
    if (this.isRenderLocation === true) {
      return '';
    }
    let textContent = this._textContent;
    let current = this.firstChild;
    while (current !== null) {
      textContent += current.textContent;
      current = current.nextSibling;
    }
    return textContent;
  }
  public set textContent(value: string) {
    this._textContent = value;
  }
  public nextSibling: AuNode | null;
  public previousSibling: AuNode | null;
  public firstChild: AuNode | null;
  public lastChild: AuNode | null;

  private _isConnected: boolean;
  private _textContent: string;

  constructor(
    name: string,
    isWrapper: boolean,
    isTarget: boolean,
    isMarker: boolean,
    isRenderLocation: boolean,
    isMounted: boolean,
    isConnected: boolean
  ) {
    this.nodeName = name;
    this.isWrapper = isWrapper;
    this.isMarker = isMarker;
    this.isRenderLocation = isRenderLocation;
    this.$start = null;
    this.$nodes = null;
    this.isTarget = isTarget;
    this.isMounted = isMounted;
    this._isConnected = isConnected;
    this.parentNode = null;
    if (isMarker || isRenderLocation) {
      this.childNodes = PLATFORM.emptyArray as AuNode[];
    } else {
      this.childNodes = [];
    }
    this._textContent = '';
    this.nextSibling = null;
    this.previousSibling = null;
    this.firstChild = null;
    this.lastChild = null;
  }

  public static createHost(): AuNode {
    return new AuNode('#au-host', false, false, false, false, true, true);
  }

  public static createMarker(): AuNode {
    return new AuNode('#au-marker', false, true, true, false, false, false);
  }

  public static createRenderLocation(): AuNode {
    const end = new AuNode('#au-end', false, false, false, true, false, false);
    const start = new AuNode('#au-start', false, false, false, true, false, false);
    end.$start = start;
    return end;
  }

  public static createText(text?: string): AuNode {
    const node = new AuNode('#text', false, false, false, false, false, false);
    if (text !== undefined) {
      node._textContent = text;
    }
    return node;
  }

  public static createTemplate(): AuNode {
    return new AuNode('TEMPLATE', true, false, false, false, false, false);
  }

  public appendChild(childNode: AuNode): this {
    if (childNode.parentNode !== null) {
      childNode.remove();
    }
    if (this.firstChild === null) {
      this.firstChild = childNode;
    } else {
      this.lastChild.nextSibling = childNode;
      childNode.previousSibling = this.lastChild;
    }
    this.lastChild = childNode;
    this.childNodes.push(childNode);
    childNode.parentNode = this;
    childNode.isMounted = true;
    childNode.isConnected = this.isConnected;
    return this;
  }

  public removeChild(childNode: AuNode): void {
    if (childNode.parentNode === this) {
      const prev = childNode.previousSibling;
      const next = childNode.nextSibling;
      if (prev !== null) {
        prev.nextSibling = next;
      }
      if (next !== null) {
        next.previousSibling = prev;
      }
      if (this.firstChild === childNode) {
        this.firstChild = next;
      }
      if (this.lastChild === childNode) {
        this.lastChild = prev;
      }
      childNode.previousSibling = null;
      childNode.nextSibling = null;
      this.childNodes.splice(this.childNodes.indexOf(childNode), 1);
      childNode.parentNode = null;
      childNode.isMounted = false;
      childNode.isConnected = false;
    }
  }

  public remove(): void {
    const currentParent = this.parentNode;
    if (currentParent !== null) {
      currentParent.removeChild(this);
    }
  }

  public replaceChild(newNode: AuNode, oldNode: AuNode): void {
    if (oldNode.parentNode !== this) {
      throw new Error('oldNode is not a child of this parent');
    }
    const idx = this.childNodes.indexOf(oldNode);
    this.childNodes.splice(idx, 1, newNode);

    newNode.previousSibling = oldNode.previousSibling;
    newNode.nextSibling = oldNode.nextSibling;
    newNode.parentNode = this;
    if (newNode.previousSibling !== null) {
      newNode.previousSibling.nextSibling = newNode;
    }
    if (newNode.nextSibling !== null) {
      newNode.nextSibling.previousSibling = newNode;
    }
    newNode.isMounted = true;
    newNode.isConnected = this.isConnected;
    if (this.firstChild === oldNode) {
      this.firstChild = newNode;
    }
    if (this.lastChild === oldNode) {
      this.lastChild = newNode;
    }

    oldNode.previousSibling = null;
    oldNode.nextSibling = null;
    oldNode.parentNode = null;
    oldNode.isMounted = false;
    oldNode.isConnected = false;
  }

  public insertBefore(newNode: AuNode, refNode: AuNode): void {
    if (newNode.parentNode !== null) {
      newNode.remove();
    }
    const idx = this.childNodes.indexOf(refNode);
    this.childNodes.splice(idx, 0, newNode);

    newNode.nextSibling = refNode;
    newNode.previousSibling = refNode.previousSibling;
    if (refNode.previousSibling !== null) {
      refNode.previousSibling.nextSibling = newNode;
    }
    refNode.previousSibling = newNode;
    newNode.parentNode = this;
    newNode.isMounted = true;
    newNode.isConnected = this.isConnected;
    if (this.firstChild === refNode) {
      this.firstChild = newNode;
    }
  }

  public cloneNode(deep?: boolean): AuNode {
    const newNode = new AuNode(this.nodeName, this.isWrapper, this.isTarget, this.isMarker, this.isRenderLocation, false, false);
    newNode._textContent = this._textContent;
    if (deep === true) {
      let current = this.firstChild;
      while (current !== null) {
        newNode.appendChild(current.cloneNode(true));
        current = current.nextSibling;
      }
    }
    return newNode;
  }

  public populateTargets(targets: AuNode[]): void {
    let current = this.firstChild;
    while (current !== null) {
      if (current.isTarget === true) {
        targets.push(current);
      }
      current.populateTargets(targets);
      current = current.nextSibling;
    }
  }

  public makeTarget(): this {
    this.isTarget = true;
    return this;
  }
}

export class AuDOM implements IDOM<AuNode> {
  public addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    return;
  }
  public appendChild(parent: AuNode, child: AuNode): void {
    parent.appendChild(child);
  }
  public cloneNode<T extends INode = AuNode>(node: T, deep?: boolean): T {
    return (node as unknown as AuNode).cloneNode(deep) as unknown as T;
  }
  public convertToRenderLocation(node: AuNode): AuNode {
    if (node.isRenderLocation) {
      return node;
    }
    const parent = node.parentNode;
    const location = AuNode.createRenderLocation();
    parent.replaceChild(location, node);
    parent.insertBefore(location.$start, location);
    return location;
  }
  public createDocumentFragment(nodeOrText?: AuNode | string): AuNode {
    return this.createTemplate(nodeOrText);
  }
  public createElement(name: string): AuNode {
    return new AuNode(name, false, false, false, false, false, false);
  }
  public createTemplate(nodeOrText?: AuNode | string): AuNode {
    const template = AuNode.createTemplate();
    if (nodeOrText !== undefined) {
      if (typeof nodeOrText === 'string') {
        template.appendChild(AuNode.createText(nodeOrText));
      } else if (nodeOrText.isWrapper === true) {
        let current = nodeOrText.firstChild;
        let next: AuNode;
        while (current !== null) {
          next = current.nextSibling;
          template.appendChild(current);
          current = next;
        }
      } else {
        template.appendChild(nodeOrText);
      }
    }
    return template;
  }
  public createTextNode(text: string): AuNode {
    return AuNode.createText(text);
  }
  public insertBefore(nodeToInsert: AuNode, referenceNode: AuNode): void {
    referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
  }
  public isMarker(node: AuNode): node is AuNode {
    return node.isMarker;
  }
  public isNodeInstance(node: AuNode): node is AuNode {
    return node instanceof AuNode;
  }
  public isRenderLocation(node: AuNode): node is AuNode {
    return node.isRenderLocation;
  }
  public makeTarget(node: AuNode): void {
    node.isTarget = true;
  }
  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(AuNode, resolver);
  }
  public remove(node: AuNode): void {
    node.remove();
  }
  public removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    return;
  }
}

export class AuProjectorLocator implements IProjectorLocator {
  public getElementProjector(dom: IDOM, $component: ICustomElement<AuNode>, host: CustomElementHost<AuNode>, def: TemplateDefinition): IElementProjector {
    return new AuProjector($component, host);
  }
}

export class AuProjector implements IElementProjector {
  public host: CustomElementHost<AuNode>;

  constructor($customElement: ICustomElement<AuNode>, host: CustomElementHost<AuNode>) {
    this.host = host;
    this.host.$customElement = $customElement;
  }

  public get children(): ArrayLike<CustomElementHost<AuNode>> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void { /* do nothing */ }

  public provideEncapsulationSource(): AuNode {
    return this.host;
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('AuProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('AuProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export class AuNodeSequence implements INodeSequence<AuNode> {
  public readonly dom: AuDOM;
  public firstChild: AuNode;
  public lastChild: AuNode;
  public childNodes: AuNode[];

  private start: AuNode;
  private end: AuNode;
  private wrapper: AuNode;
  private targets: AuNode[];

  constructor(dom: AuDOM, wrapper: AuNode) {
    this.dom = dom;
    const targets: AuNode[] = [];
    wrapper.populateTargets(targets);
    let target: AuNode;
    let i = 0;
    const len = targets.length;
    for (; i < len; ++i) {
      target = targets[i];
      if (target.isMarker) {
        targets[i] = dom.convertToRenderLocation(target);
      }
    }
    this.childNodes = wrapper.childNodes.slice();
    this.firstChild = wrapper.firstChild;
    this.lastChild = wrapper.lastChild;
    this.start = null;
    this.end = null;
    this.wrapper = wrapper;
    this.targets = targets;
  }

  public findTargets(): AuNode[] {
    return this.targets;
  }

  public insertBefore(refNode: AuNode): void {
    const parent = refNode.parentNode;
    let current = this.firstChild;
    let next: AuNode;
    while (current !== null) {
      next = current.nextSibling;
      parent.insertBefore(current, refNode);
      current = next;
    }
    if (refNode.isRenderLocation) {
      this.end = refNode;
      this.start = refNode.$start;
      if (this.start.$nodes === null) {
        this.start.$nodes = this;
      } else {
        this.start.$nodes = PLATFORM.emptyObject;
      }
    }
  }

  public appendTo(parent: AuNode): void {
    let current = this.firstChild;
    let next: AuNode;
    while (current !== null) {
      next = current.nextSibling;
      parent.appendChild(current);
      current = next;
    }
  }

  public remove(): void {
    const wrapper = this.wrapper;
    if (this.start !== null && this.start.$nodes === this) {
      const end = this.end;
      let next: AuNode;
      let current = this.start.nextSibling;
      while (current !== end) {
        next = current.nextSibling;
        wrapper.appendChild(current);
        current = next;
      }
      this.start.$nodes = null;
      this.start = null;
      this.end = null;
    } else {
      let current = this.firstChild;
      if (current.parentNode !== wrapper) {
        const end = this.lastChild;
        let next: AuNode;
        while (current !== null) {
          next = current.nextSibling;
          wrapper.appendChild(current);
          if (current === end) {
            break;
          }
          current = next;
        }
      }
    }
  }
}

export class AuNodeSequenceFactory implements INodeSequenceFactory<AuNode> {
  private readonly dom: AuDOM;
  private readonly wrapper: AuNode;

  constructor(dom: AuDOM, node: AuNode) {
    this.dom = dom;
    this.wrapper = dom.createDocumentFragment(node);
  }

  public createNodeSequence(): AuNodeSequence {
    return new AuNodeSequence(this.dom, this.wrapper.cloneNode(true));
  }
}

export class AuDOMInitializer implements IDOMInitializer {
  public static inject: unknown[] = [IContainer];

  private readonly container: IContainer;

  constructor(container: IContainer) {
    this.container = container;
  }

  public initialize(config: ISinglePageApp<AuNode>): AuDOM {
    if (this.container.has(IDOM, false)) {
      return this.container.get(IDOM) as AuDOM;
    }
    const dom = new AuDOM();
    Registration.instance(IDOM, dom).register(this.container, IDOM);
    return dom;
  }
}

export class AuTemplateFactory implements ITemplateFactory<AuNode> {
  public static inject: unknown[] = [IDOM];

  private readonly dom: AuDOM;

  constructor(dom: AuDOM) {
    this.dom = dom;
  }

  public create(parentRenderContext: IRenderContext<AuNode>, definition: TemplateDefinition): ITemplate<AuNode> {
    return new CompiledTemplate<AuNode>(this.dom, definition, new AuNodeSequenceFactory(this.dom, definition.template as AuNode), parentRenderContext);
  }
}

export class AuObserverLocator implements ITargetAccessorLocator, ITargetObserverLocator {
  public getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver {
    return null;
  }
  public overridesAccessor(obj: unknown, propertyName: string): boolean {
    return false;
  }
  public getAccessor(lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor {
    return null;
  }
  public handles(obj: unknown): boolean {
    return false;
  }
}

export class AuTextInstruction implements ITargetedInstruction {
  public readonly type: 'au';
  public readonly from: IsBindingBehavior;

  constructor(from: IsBindingBehavior) {
    this.type = 'au';
    this.from = from;
  }
}

@inject(IObserverLocator)
@instructionRenderer('au')
/** @internal */
export class AuTextRenderer implements IInstructionRenderer {
  private observerLocator: IObserverLocator;

  constructor(observerLocator: IObserverLocator) {
    this.observerLocator = observerLocator;
  }

  public render(dom: IDOM, context: IRenderContext<AuNode>, renderable: IRenderable<AuNode>, target: AuNode, instruction: AuTextInstruction): void {
    if (Tracer.enabled) { Tracer.enter('AuTextRenderer.render', slice.call(arguments)); }
    let realTarget: AuNode;
    if (target.isRenderLocation) {
      realTarget = AuNode.createText();
      target.parentNode.insertBefore(realTarget, target);
    } else {
      realTarget = target;
    }
    const bindable = new Binding(instruction.from, realTarget, 'textContent', BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export const AuDOMConfiguration = {
  register(container: IContainer): void {
    container.register(
      RuntimeConfiguration,
      AuTextRenderer as unknown as IRegistry,
      Registration.singleton(IDOM, AuDOM),
      Registration.singleton(IDOMInitializer, AuDOMInitializer),
      Registration.singleton(IProjectorLocator, AuProjectorLocator),
      Registration.singleton(ITargetAccessorLocator, AuObserverLocator),
      Registration.singleton(ITargetObserverLocator, AuObserverLocator),
      Registration.singleton(ITemplateFactory, AuTemplateFactory)
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(AuDOMConfiguration);
    return container;
  }
};

export const AuDOMTest = {
  setup(): { au: Aurelia; container: IContainer; lifecycle: ILifecycle; host: AuNode } {
    const container = AuDOMConfiguration.createContainer();
    const au = new Aurelia(container);
    const lifecycle = container.get(ILifecycle);
    const host = AuNode.createHost();
    return { au, container, lifecycle, host };
  },
  createTextDefinition(expression: string, name: string = `${expression}-text`): ITemplateDefinition {
    return {
      build: { required: false },
      name,
      template: AuNode.createText().makeTarget(),
      // @ts-ignore
      instructions: [[new AuTextInstruction(parseExpression(expression))]]
    };
  },
  createTemplateControllerDefinition(instruction: HydrateTemplateController, name: string = instruction.res): ITemplateDefinition {
    return {
      build: { required: false },
      name,
      template: AuNode.createMarker(),
      instructions: [[instruction]]
    };
  },
  createElementDefinition(instruction: HydrateElementInstruction, name: string = instruction.res): ITemplateDefinition {
    return {
      build: { required: false },
      name,
      template: AuNode.createMarker(),
      instructions: [[instruction]]
    };
  },
  createIfInstruction(expression: string, def: ITemplateDefinition): HydrateTemplateController {
    return new HydrateTemplateController(
      def,
      'if',
      // @ts-ignore
      [new ToViewBindingInstruction(parseExpression(expression), 'value')]
    );
  },
  createElseInstruction(def: ITemplateDefinition): HydrateTemplateController {
    return new HydrateTemplateController(def, 'else', [], true);
  },
  createRepeatInstruction(expression: string, def: ITemplateDefinition): HydrateTemplateController {
    return new HydrateTemplateController(
      def,
      'repeat',
      // @ts-ignore
      [new IteratorBindingInstruction(parseExpression(expression, BindingType.ForCommand), 'items')]
    );
  },
  createReplaceableInstruction(def: ITemplateDefinition): HydrateTemplateController {
    return new HydrateTemplateController(def, 'replaceable', []);
  },
  createWithInstruction(expression: string, def: ITemplateDefinition): HydrateTemplateController {
    return new HydrateTemplateController(
      def,
      'with',
      // @ts-ignore
      [new ToViewBindingInstruction(parseExpression(expression), 'value')]
    );
  },
  createElementInstruction(name: string, bindings: [string, string][], parts?: Record<string, ITemplateDefinition>): HydrateElementInstruction {
    return new HydrateElementInstruction(
      name,
      // @ts-ignore
      bindings.map(([from, to]) => new ToViewBindingInstruction(parseExpression(from), to)),
      parts
    );
  },
  createLetInstruction(bindings: [string, string][], toViewModel: boolean = false): LetElementInstruction {
    return new LetElementInstruction(
      // @ts-ignore
      bindings.map(([from, to]) => new LetBindingInstruction(parseExpression(from), to)),
      toViewModel
    );
  }
};
