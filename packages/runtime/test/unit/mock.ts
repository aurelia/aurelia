import { PLATFORM, IContainer, IDisposable, ImmutableArray } from '../../../kernel/src';
import {
  INodeSequence,
  ITemplate,
  IRenderContext,
  IRenderingEngine,
  TemplatePartDefinitions,
  IRenderable,
  TemplateDefinition,
  IViewFactory,
  ITargetedInstruction,
  IRenderLocation,
  IView,
  IBindScope,
  IAttach,
  IScope,
  BindingFlags,
  IDetachLifecycle,
  IAttachLifecycle,
  ICustomElementType,
  ICustomElement,
  Binding,
  BindingMode,
  IExpression,
  BindingContext,
  IElementProjector,
  InstanceProvider,
  ViewFactoryProvider,
  IObserverLocator,
  ObserverLocator,
  ViewFactory,
  If,
  Else,
  AccessMember,
  AccessScope,
  ForOfStatement,
  BindingIdentifier,
  RuntimeBehavior,
  IChangeSet
} from '../../src';

export class MockContext {
  public log: any[] = [];
}
export type ExposedContext = IRenderContext & IDisposable & IContainer;

export class MockCustomElement implements ICustomElement {
  public $bindables: IBindScope[];
  public $attachables: IAttach[];
  public $isAttached: boolean;
  public $isBound: boolean;
  public $scope: IScope;
  public $projector: IElementProjector;
  public $context: IRenderContext;
  public $nodes: MockNodeSequence;
  public $encapsulationSource: Node;
  public $host: Node;
  public $hydrate(renderingEngine: IRenderingEngine, host: Node): void {
    this.$host = host;
    const Type = this.constructor as ICustomElementType;
    const description = Type.description;

    this.$bindables = [];
    this.$attachables = [];
    this.$isAttached = false;
    this.$isBound = false;
    this.$scope = BindingContext.createScope(this);

    this.$context = createMockRenderContext(renderingEngine, <ExposedContext>renderingEngine['container'], PLATFORM.emptyArray);
    const template = new MockTemplate(renderingEngine, <ExposedContext>renderingEngine['container'], description)
    this.$context = template.renderContext;

    const nodes = this.$nodes = MockNodeSequence.createSimpleMarker();
    this.$context.render(this, nodes.findTargets(), description, host);
  }

  public $bind(flags: BindingFlags): void {
    if (this.$isBound) {
      return;
    }
    const scope = this.$scope;
    const bindables = this.$bindables;
    for (let i = 0, ii = bindables.length; i < ii; ++i) {
      bindables[i].$bind(flags | BindingFlags.fromBind, scope);
    }
    this.$isBound = true;
  }

  public $unbind(flags: BindingFlags): void {
    if (this.$isBound) {
      const bindables = this.$bindables;
      let i = bindables.length;
      while (i--) {
        bindables[i].$unbind(flags | BindingFlags.fromUnbind);
      }
      this.$isBound = false;
    }
  }

  public $attach(encapsulationSource: Node, lifecycle: IAttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }
    this.$encapsulationSource = encapsulationSource;
    const attachables = this.$attachables;
    for (let i = 0, ii = attachables.length; i < ii; ++i) {
      attachables[i].$attach(encapsulationSource, lifecycle);
    }
    lifecycle.queueAddNodes(this);
    this.$isAttached = true;
  }

  public $detach(lifecycle: IDetachLifecycle): void {
    if (this.$isAttached) {
      lifecycle.queueRemoveNodes(this);
      const attachables = this.$attachables;
      let i = attachables.length;
      while (i--) {
        attachables[i].$detach(lifecycle);
      }
      this.$isAttached = false;
    }
  }

  public $cache(): void {
    const attachables = this.$attachables;
    let i = attachables.length;
    while (i--) {
      attachables[i].$cache();
    }
  }

  public $addNodes(): void {
    this.$nodes.appendTo(this.$host);
    this.$addNodes = PLATFORM.noop;
  }

  public $removeNodes(): void { }
}

export function createMockRenderContext(
  renderingEngine: IRenderingEngine,
  parentRenderContext: IRenderContext,
  dependencies: ImmutableArray<any>): IRenderContext {

  const context = <ExposedContext>parentRenderContext.createChild();
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider(renderingEngine);
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = renderingEngine.createRenderer(context);

  context.registerResolver(Node, elementProvider);
  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }
  context.render = function(
    renderable: IView,
    targets: ArrayLike<Node>,
    templateDefinition: TemplateDefinition,
    host?: Node,
    parts?: TemplatePartDefinitions): void {
    renderer.render(renderable, targets, templateDefinition, host, parts)
  };

  context.beginComponentOperation = function(
    renderable: IView,
    target: any,
    instruction: ITargetedInstruction,
    factory?: IViewFactory,
    parts?: TemplatePartDefinitions,
    location?: IRenderLocation): IDisposable {

    renderableProvider.prepare(renderable);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);
    if (factory) {
      factoryProvider.prepare(factory, parts);
    }
    if (location) {
      renderLocationProvider.prepare(location);
    }
    return context;
  };
  context.dispose = function(): void {
    factoryProvider.dispose();
    renderableProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
    renderLocationProvider.dispose();
  };

  return context;
}


const marker = document.createElement('au-marker');
marker.classList.add('au');
export const createMarker = marker.cloneNode.bind(marker, false);

const emptyTextNode = document.createTextNode(' ');
export const createEmptyTextNode = emptyTextNode.cloneNode.bind(emptyTextNode, false);

const renderLocation = document.createComment('au-loc');
export const createRenderLocation = renderLocation.cloneNode.bind(renderLocation, false);

export class MockNodeSequence implements INodeSequence {
  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  public fragment: DocumentFragment;

  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;
    this.childNodes = PLATFORM.toArray(fragment.childNodes);
  }

  public findTargets(): ArrayLike<Node> {
    return this.fragment.querySelectorAll('.au');
  }

  public insertBefore(refNode: Node): void {
    refNode.parentNode.insertBefore(this.fragment, refNode);
  }

  public appendTo(parent: Node): void {
    parent.appendChild(this.fragment);
  }

  public remove(): void {
    const fragment = this.fragment;
    let current = this.firstChild;
    if (current.parentNode !== fragment) {
      const append = fragment.appendChild.bind(fragment);
      const end = this.lastChild;
      let next: Node;
      while (current) {
        next = current.nextSibling;
        append(current);
        if (current === end) {
          break;
        }
        current = next;
      }
    }
  }

  public static createSimpleMarker(): MockNodeSequence {
    const fragment = document.createDocumentFragment();
    const marker = createMarker();
    fragment.appendChild(marker);
    return new MockNodeSequence(fragment);
  }

  public static createRenderLocation(): MockNodeSequence {
    const fragment = document.createDocumentFragment();
    const location = createRenderLocation();
    fragment.appendChild(location);
    return new MockNodeSequence(fragment);
  }

  public static createTextBindingMarker(): MockNodeSequence {
    const fragment = document.createDocumentFragment();
    const marker = createMarker();
    const textNode = createEmptyTextNode();
    fragment.appendChild(marker);
    fragment.appendChild(textNode);
    return new MockNodeSequence(fragment);
  }
}

export class MockTextNodeSequence implements INodeSequence {
  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  public fragment: DocumentFragment;

  constructor() {
    const fragment = this.fragment = document.createDocumentFragment();
    const textNode = this.firstChild = this.lastChild = document.createTextNode('');
    fragment.appendChild(textNode);
    this.childNodes = [textNode];
  }

  public findTargets(): ArrayLike<Node> {
    return PLATFORM.emptyArray;
  }

  public insertBefore(refNode: Node): void {
    refNode.parentNode.insertBefore(this.fragment, refNode);
  }

  public appendTo(parent: Node): void {
    parent.appendChild(this.fragment);
  }

  public remove(): void {
    const fragment = this.fragment;
    const textNode = this.firstChild;
    if (textNode.parentNode !== fragment) {
      fragment.appendChild(textNode);
    }
  }
}

export class MockTemplate implements ITemplate {
  public renderContext: IRenderContext;
  public template: HTMLTemplateElement;

  constructor(
    renderingEngine: IRenderingEngine,
    parentRenderContext: IRenderContext,
    public templateDefinition: TemplateDefinition) {

    this.renderContext = createMockRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
    const markupOrNode = templateDefinition.templateOrNode;
    if (markupOrNode instanceof Node) {
      if ((<HTMLTemplateElement>markupOrNode).content) {
        this.template = markupOrNode as any;
      } else {
        this.template = document.createElement('template');
        this.template.content.appendChild(<Node>markupOrNode);
      }
    } else {
      this.template = document.createElement('template');
      this.template.innerHTML = <string>markupOrNode;
    }
  }

  public createFor(renderable: IRenderable, host?: Node, replacements?: TemplatePartDefinitions): MockNodeSequence {
    const nodes = new MockNodeSequence(<DocumentFragment>this.template.content.cloneNode(true));
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, replacements);
    return nodes;
  }
}

export class MockTextNodeTemplate {
  constructor(
    public sourceExpression: IExpression,
    public observerLocator: IObserverLocator
  ) {}

  public createFor(renderable: { $bindables: IBindScope[] }): MockTextNodeSequence {
    const nodes = new MockTextNodeSequence();
    renderable.$bindables.push(new Binding(this.sourceExpression, nodes.firstChild, 'textContent', BindingMode.toView, this.observerLocator, null));
    return nodes;
  }
}


const expressions = {
  if: new AccessMember(new AccessScope('item'), 'if'),
  else: new AccessMember(new AccessScope('item'), 'else')
};

export class MockIfTextNodeTemplate {
  constructor(
    public sourceExpression: IExpression,
    public observerLocator: IObserverLocator,
    public changeSet: IChangeSet
  ) {}

  public createFor(renderable: IView): MockNodeSequence {
    const nodes = MockNodeSequence.createRenderLocation();

    const observerLocator = new ObserverLocator(this.changeSet, null, null, null);
    const factory = new ViewFactory(null, <any>new MockTextNodeTemplate(expressions.if, observerLocator));

    const sut = new If(factory, nodes.firstChild);

    (<any>sut)['$isAttached'] = false;
    (<any>sut)['$isBound'] = false;
    (<any>sut)['$scope'] = null;

    const behavior = RuntimeBehavior.create(<any>If, sut);
    behavior.applyTo(sut, this.changeSet);

    renderable.$attachables.push(sut);
    renderable.$bindables.push(new Binding(this.sourceExpression, sut, 'value', BindingMode.toView, this.observerLocator, null));
    renderable.$bindables.push(sut);
    return nodes;
  }
}

export class MockElseTextNodeTemplate {
  constructor(
    public sourceExpression: IExpression,
    public observerLocator: IObserverLocator,
    public changeSet: IChangeSet
  ) {}

  public createFor(renderable: IView): MockNodeSequence {
    const nodes = MockNodeSequence.createRenderLocation();

    const observerLocator = new ObserverLocator(this.changeSet, null, null, null);
    const factory = new ViewFactory(null, <any>new MockTextNodeTemplate(expressions.else, observerLocator));

    const sut = new Else(factory, nodes.firstChild);

    sut.link(<any>renderable.$attachables[renderable.$attachables.length - 1]);

    (<any>sut)['$isAttached'] = false;
    (<any>sut)['$isBound'] = false;
    (<any>sut)['$scope'] = null;

    const behavior = RuntimeBehavior.create(<any>Else, <any>sut);
    behavior.applyTo(<any>sut, this.changeSet);

    renderable.$attachables.push(<any>sut);
    renderable.$bindables.push(new Binding(this.sourceExpression, sut, 'value', BindingMode.toView, this.observerLocator, null));
    renderable.$bindables.push(<any>sut);
    return nodes;
  }
}

export class MockIfElseTextNodeTemplate {
  constructor(
    public sourceExpression: IExpression,
    public observerLocator: IObserverLocator,
    public changeSet: IChangeSet
  ) {}

  public createFor(renderable: IView): MockNodeSequence {
    const ifNodes = MockNodeSequence.createRenderLocation();

    const observerLocator = new ObserverLocator(this.changeSet, null, null, null);
    const ifFactory = new ViewFactory(null, <any>new MockTextNodeTemplate(expressions.if, observerLocator));

    const ifSut = new If(ifFactory, ifNodes.firstChild);

    (<any>ifSut)['$isAttached'] = false;
    (<any>ifSut)['$isBound'] = false;
    (<any>ifSut)['$scope'] = null;

    const ifBehavior = RuntimeBehavior.create(<any>If, ifSut);
    ifBehavior.applyTo(ifSut, this.changeSet);

    renderable.$attachables.push(ifSut);
    renderable.$bindables.push(new Binding(this.sourceExpression, ifSut, 'value', BindingMode.toView, this.observerLocator, null));
    renderable.$bindables.push(ifSut);

    const elseNodes = MockNodeSequence.createRenderLocation();

    const elseFactory = new ViewFactory(null, <any>new MockTextNodeTemplate(expressions.else, observerLocator));

    const elseSut = new Else(elseFactory, elseNodes.firstChild);

    elseSut.link(<any>renderable.$attachables[renderable.$attachables.length - 1]);

    (<any>elseSut)['$isAttached'] = false;
    (<any>elseSut)['$isBound'] = false;
    (<any>elseSut)['$scope'] = null;

    const elseBehavior = RuntimeBehavior.create(<any>Else, <any>elseSut);
    elseBehavior.applyTo(<any>elseSut, this.changeSet);

    renderable.$attachables.push(<any>elseSut);
    renderable.$bindables.push(new Binding(this.sourceExpression, elseSut, 'value', BindingMode.toView, this.observerLocator, null));
    renderable.$bindables.push(<any>elseSut);

    return ifNodes;
  }
}

