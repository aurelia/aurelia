import {
  DI,
  IContainer,
  IDisposable,
  IResourceType,
  PLATFORM,
  Writable,
  IServiceLocator
} from '@aurelia/kernel';
import {
  AccessMember,
  AccessScope,
  addBinding,
  addComponent,
  Binding,
  BindingMode,
  Else,
  ExpressionKind,
  IAttributeDefinition,
  IBinding,
  ICustomAttribute,
  ICustomElement,
  ICustomElementType,
  If,
  ILifecycle,
  INode,
  INodeSequence,
  IController,
  IRenderContext,
  IRenderer,
  IRenderingEngine,
  IScope,
  ISignaler,
  ITemplate,
  ITemplateDefinition,
  IViewFactory,
  LifecycleFlags,
  ObserverLocator,
  RuntimeBehavior,
  State,
  TemplatePartDefinitions,
  ViewFactory,
  CompositionCoordinator,
  IDOM
} from '@aurelia/runtime';
import { spy } from 'sinon';
import { HTMLTestContext } from './html-test-context';

export class MockBindingBehavior {
  public calls: [keyof MockBindingBehavior, ...any[]][] = [];

  public bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...rest: any[]): void {
    this.trace('bind', flags, scope, binding, ...rest);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...rest: any[]): void {
    this.trace('unbind', flags, scope, binding, ...rest);
  }

  public trace(fnName: keyof MockBindingBehavior, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export type IComponentLifecycleMock = InstanceType<ReturnType<typeof defineComponentLifecycleMock>>;

export function defineComponentLifecycleMock() {
  return class ComponentLifecycleMock<T extends INode = INode> implements IController<T> {
    public $state: State;
    public $scope: IScope;
    public $nodes!: INodeSequence<T>;
    public $context!: IRenderContext<T>;
    public readonly $lifecycle: ILifecycle;
    public calls: [keyof ComponentLifecycleMock, ...any[]][] = [];

    constructor() {
      this.$state = State.none;
      this.$scope = null!;
      this.$lifecycle = DI.createContainer().get(ILifecycle);
    }

    public created(): void {
      this.trace(`created`);
      this.verifyStateBit(State.isBound, false, 'created');
      this.verifyStateBit(State.isAttached, false, 'created');
    }
    public binding(flags: LifecycleFlags): void {
      this.trace(`binding`, flags);
    }
    public bound(flags: LifecycleFlags): void {
      this.trace(`bound`, flags);
      this.verifyStateBit(State.isBound, true, 'bound');
    }
    public attaching(flags: LifecycleFlags): void {
      this.trace(`attaching`, flags);
      this.verifyStateBit(State.isBound, true, 'attaching');
      this.verifyStateBit(State.isAttached, false, 'attaching');
    }
    public attached(flags: LifecycleFlags): void {
      this.trace(`attached`, flags);
      this.verifyStateBit(State.isBound, true, 'attached');
      this.verifyStateBit(State.isAttached, true, 'attached');
    }
    public detaching(flags: LifecycleFlags): void {
      this.trace(`detaching`, flags);
      this.verifyStateBit(State.isBound, true, 'detaching');
      this.verifyStateBit(State.isAttached, true, 'detaching');
    }
    public detached(flags: LifecycleFlags): void {
      this.trace(`detached`, flags);
      this.verifyStateBit(State.isBound, true, 'detached');
      this.verifyStateBit(State.isAttached, false, 'detached');
    }
    public unbinding(flags: LifecycleFlags): void {
      this.trace(`unbinding`, flags);
      this.verifyStateBit(State.isBound, true, 'detached');
    }
    public unbound(flags: LifecycleFlags): void {
      this.trace(`unbound`, flags);
      this.verifyStateBit(State.isBound, false, 'detached');
    }
    public render(host: INode, parts: Record<string, ITemplateDefinition>): void {
      this.trace(`render`, host, parts);
    }
    public caching(flags: LifecycleFlags): void {
      this.trace(`caching`, flags);
    }

    public trace(fnName: keyof ComponentLifecycleMock, ...args: any[]): void {
      this.calls.push([fnName, ...args]);
    }

    public verifyPropertyValue(prop: keyof ComponentLifecycleMock, value: any, during?: string): void {
      if (this[prop] !== value) {
        let msg = `expected ${prop} to be ${value}`;
        if (during !== undefined) {
          msg += ` during ${during}() lifecycle hook`;
        }
        msg += `, got but: ${this[prop]}`;
        this.fail(msg);
      }
    }

    public verifyStateBit(value: any, isTrue: boolean, during?: string): void {
      if (!isTrue) {
        if ((this.$state & value) === value) {
          let msg = `expected $state to NOT have flag ${value}`;
          if (during !== undefined) {
            msg += ` during ${during}() lifecycle hook`;
          }
          msg += `, got but: ${this.$state}`;
          this.fail(msg);
        }
      } else {
        if ((this.$state & value) !== value) {
          let msg = `expected $state to have flag ${value}`;
          if (during !== undefined) {
            msg += ` during ${during}() lifecycle hook`;
          }
          msg += `, got but: ${this.$state}`;
          this.fail(msg);
        }
      }
    }

    public verifyCreatedCalled(): void {
      this.verifyLastCall('created');
    }
    public verifyBindingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`binding`, flags);
    }
    public verifyBoundCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`bound`, flags);
    }
    public verifyAttachingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`attaching`, flags);
    }
    public verifyAttachedCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`attached`, flags);
    }
    public verifyDetachingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`detaching`, flags);
    }
    public verifyDetachedCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`detached`, flags);
    }
    public verifyUnbindingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`unbinding`, flags);
    }
    public verifyUnboundCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`unbound`, flags);
    }
    public verifyRenderCalled(host: INode, parts: Record<string, ITemplateDefinition>): void {
      this.verifyLastCall(`render`, host, parts);
    }
    public verifyCachingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`caching`, flags);
    }
    public verifyLastCall(name: string, ...args: any[]): void {
      const calls = this.calls;
      if (calls.length === 0) {
        this.fail(`expected "${name}" to be the last called method, but no methods on this mock were called at all`);
      }
      const lastCall = calls.pop()!;
      if (lastCall[0] !== name) {
        if (calls.length === 0) {
          this.fail(`expected "${name}" to be the last called method, but the ONLY method called on this mock was "${lastCall[0]}"`);
        } else {
          const callChain = calls.map(c => `"${c[0]}"`).join('->');
          this.fail(`expected "${name}" to be the last called method, but the last method called on this mock was "${lastCall[0]}", preceded by: ${callChain}`);
        }
      }
      for (let i = 0, ii = args.length; i < ii; ++i) {
        const expected = args[i];
        const actual = lastCall[i + 1];
        if (expected !== actual) {
          this.fail(`expected argument #${i} of the call to "${name}" to be: ${expected}, but instead got: ${actual}`);
        }
      }
      if (lastCall.length > args.length + 1) {
        this.fail(`expected "${name}" to have been called with ${args.length} arguments, but it was called with ${lastCall.length - 1} arguments instead (last argument is: ${lastCall[lastCall.length - 1]})`);
      }
    }
    public verifyNoFurtherCalls(): void {
      if (this.calls.length > 0) {
        const callChain = this.calls.map(c => `"${c[0]}"`).join('->');
        this.fail(`expected no further calls, but found additional calls: ${callChain}`);
      }
    }
    public fail(message: string) {
      throw new Error(`ComponentLifecycleMock: ${message}`);
    }
  };
}

export interface MockServiceLocator extends IContainer {}
export class MockServiceLocator {
  public calls: [keyof MockServiceLocator, ...any[]][] = [];

  constructor(public registrations: Map<any, any>) {}

  public get(key: any): any {
    this.trace('get', key);
    return this.registrations.get(key);
  }

  public trace(fnName: keyof MockServiceLocator, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export interface MockSignaler extends ISignaler {}
export class MockSignaler {
  public calls: [keyof MockSignaler, ...any[]][] = [];

  public addSignalListener(...args: any[]): void {
    this.trace('addSignalListener', ...args);
  }

  public removeSignalListener(...args: any[]): void {
    this.trace('removeSignalListener', ...args);
  }

  public trace(fnName: keyof MockSignaler, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export class MockPropertySubscriber {
  public calls: [keyof MockPropertySubscriber, ...any[]][] = [];

  public handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void {
    this.trace(`handleChange`, newValue, previousValue, flags);
  }

  public trace(fnName: keyof MockPropertySubscriber, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}

export class MockTracingExpression {
  public $kind: ExpressionKind = ExpressionKind.HasBind | ExpressionKind.HasUnbind;
  public calls: [keyof MockTracingExpression, ...any[]][] = [];

  constructor(public inner: any) {}

  public evaluate(...args: any[]): any {
    this.trace('evaluate', ...args);
    return this.inner.evaluate(...args);
  }

  public assign(...args: any[]): any {
    this.trace('assign', ...args);
    return this.inner.assign(...args);
  }

  public connect(...args: any[]): any {
    this.trace('connect', ...args);
    this.inner.connect(...args);
  }

  public bind(...args: any[]): any {
    this.trace('bind', ...args);
    if (this.inner.bind) {
      this.inner.bind(...args);
    }
  }

  public unbind(...args: any[]): any {
    this.trace('unbind', ...args);
    if (this.inner.unbind) {
      this.inner.unbind(...args);
    }
  }

  public accept(...args: any[]): any {
    this.trace('accept', ...args);
    this.inner.accept(...args);
  }

  public trace(fnName: keyof MockTracingExpression, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}
export class MockValueConverter {
  public calls: [keyof MockValueConverter, ...any[]][] = [];
  public fromView!: MockValueConverter['$fromView'];
  public toView!: MockValueConverter['$toView'];

  constructor(methods: string[]) {
    for (const method of methods) {
      this[method as 'fromView' | 'toView'] = this[`$${method}` as '$toView' | '$fromView'];
    }
  }

  public $fromView(value: any, ...args: any[]): any {
    this.trace('fromView', value, ...args);
    return value;
  }

  public $toView(value: any, ...args: any[]): any {
    this.trace('toView', value, ...args);
    return value;
  }

  public trace(fnName: keyof MockValueConverter, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}


export class MockContext {
  public log: any[] = [];
}
export type ExposedContext = IRenderContext & IDisposable & IContainer;

export class MockNodeSequence implements INodeSequence {
  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  public fragment: DocumentFragment;

  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    this.firstChild = fragment.firstChild!;
    this.lastChild = fragment.lastChild!;
    this.childNodes = PLATFORM.toArray(fragment.childNodes);
  }

  public static createSimpleMarker(ctx: HTMLTestContext): MockNodeSequence {
    const fragment = ctx.doc.createDocumentFragment();
    const marker = ctx.createElement('au-m');
    marker.classList.add('au');
    fragment.appendChild(marker);
    return new MockNodeSequence(fragment);
  }

  public static createRenderLocation(ctx: HTMLTestContext): MockNodeSequence {
    const fragment = ctx.doc.createDocumentFragment();
    const location = ctx.doc.createComment('au-loc');
    fragment.appendChild(location);
    return new MockNodeSequence(fragment);
  }

  public static createTextBindingMarker(ctx: HTMLTestContext): MockNodeSequence {
    const fragment = ctx.doc.createDocumentFragment();
    const marker = ctx.createElement('au-m');
    marker.classList.add('au');
    const textNode = ctx.doc.createTextNode('');
    fragment.appendChild(marker);
    fragment.appendChild(textNode);
    return new MockNodeSequence(fragment);
  }

  public findTargets(): ArrayLike<Node> {
    return this.fragment.querySelectorAll('.au');
  }

  public insertBefore(refNode: Node): void {
    refNode.parentNode!.insertBefore(this.fragment, refNode);
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
        next = current.nextSibling!;
        append(current);
        if (current === end) {
          break;
        }
        current = next;
      }
    }
  }
}

export class MockTextNodeSequence implements INodeSequence {
  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  public fragment: DocumentFragment;

  constructor(ctx: HTMLTestContext) {
    const fragment = this.fragment = ctx.doc.createDocumentFragment();
    const textNode = this.firstChild = this.lastChild = ctx.doc.createTextNode('');
    fragment.appendChild(textNode);
    this.childNodes = [textNode];
  }

  public findTargets(): ArrayLike<Node> {
    return [this.firstChild];
  }

  public insertBefore(refNode: Node): void {
    if (refNode) {
      refNode.parentNode!.insertBefore(this.fragment, refNode);
    }
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

export class MockTextNodeTemplate {
  constructor(
    public sourceExpression: any,
    public observerLocator: any,
    public container: any
  ) {}

  public render(renderable: Partial<IController>, host?: INode, parts?: TemplatePartDefinitions): void {
    const nodes = (renderable as Writable<IController>).$nodes = new MockTextNodeSequence(undefined!);
    addBinding(renderable as IController, new Binding(this.sourceExpression, nodes.firstChild, 'textContent', BindingMode.toView, this.observerLocator, this.container));
  }
}

const expressions = {
  if: new AccessMember(new AccessScope('item'), 'if'),
  else: new AccessMember(new AccessScope('item'), 'else')
};

export class MockIfTextNodeTemplate {
  constructor(
    public dom: any,
    public sourceExpression: any,
    public observerLocator: any,
    public lifecycle: any,
    public container: any
  ) {}

  public render(renderable: Partial<IController>, host?: INode, parts?: TemplatePartDefinitions): void {
    const nodes = (renderable as Writable<IController>).$nodes = MockNodeSequence.createRenderLocation(undefined!);

    const observerLocator = new ObserverLocator(this.lifecycle, null, null, null);
    const factory = new ViewFactory(null!, new MockTextNodeTemplate(expressions.if, observerLocator, this.container) as any, this.lifecycle);

    //@ts-ignore
    const sut = new If(factory, nodes.firstChild, new CompositionCoordinator(this.lifecycle));

    (sut as any)['$isAttached'] = false;
    (sut as any)['$scope'] = null;

    const behavior = RuntimeBehavior.create(If as any);
    behavior.applyTo(LifecycleFlags.none, sut, this.lifecycle);

    addComponent(renderable as IController, sut);
    addBinding(renderable as IController, new Binding(this.sourceExpression, sut, 'value', BindingMode.toView, this.observerLocator, this.container));
  }
}

export class MockIfElseTextNodeTemplate {
  constructor(
    public dom: any,
    public sourceExpression: any,
    public observerLocator: any,
    public lifecycle: any,
    public container: any
  ) {}

  public render(renderable: Partial<IController>, host?: INode, parts?: TemplatePartDefinitions): void {
    const ifNodes = (renderable as Writable<IController>).$nodes = MockNodeSequence.createRenderLocation(undefined!);

    const observerLocator = new ObserverLocator(this.lifecycle, null, null, null);
    const ifFactory = new ViewFactory(null!, new MockTextNodeTemplate(expressions.if, observerLocator, this.container) as any, this.lifecycle);

    const ifSut = new If(ifFactory, ifNodes.firstChild, new CompositionCoordinator(this.lifecycle));

    (ifSut as any)['$isAttached'] = false;
    (ifSut as any)['$state'] = State.none;
    (ifSut as any)['$scope'] = null;

    const ifBehavior = RuntimeBehavior.create(If as any);
    ifBehavior.applyTo(LifecycleFlags.none, ifSut, this.lifecycle);

    addComponent(renderable as IController, ifSut);
    addBinding(renderable as IController, new Binding(this.sourceExpression, ifSut, 'value', BindingMode.toView, this.observerLocator, this.container));

    const elseFactory = new ViewFactory(null!, new MockTextNodeTemplate(expressions.else, observerLocator, this.container) as any, this.lifecycle);

    const elseSut = new Else(elseFactory);

    elseSut.link(renderable.$componentTail as any);

    (elseSut as any)['$isAttached'] = false;
    (elseSut as any)['$state'] = State.none;
    (elseSut as any)['$scope'] = null;

    const elseBehavior = RuntimeBehavior.create(Else as any);
    elseBehavior.applyTo(LifecycleFlags.none, elseSut as any, this.lifecycle);

    addComponent(renderable as IController, elseSut as any);
    addBinding(renderable as IController, new Binding(this.sourceExpression, elseSut, 'value', BindingMode.toView, this.observerLocator, this.container));
  }
}

export class MockRenderingEngine implements IRenderingEngine {
  public calls: [keyof MockRenderingEngine, ...any[]][];

  constructor(
    public elementTemplate: ITemplate,
    public viewFactory: IViewFactory,
    public renderer: IRenderer,
    public runtimeBehaviorApplicator: (type: any, instance: any) => void
  ) {
    this.calls = [];
  }

  public getElementTemplate<T extends INode = INode>(
    dom: IDOM<T>,
    definition: Required<ITemplateDefinition>,
    parentContext: IServiceLocator,
    componentType: ICustomElementType<T> | null,
  ): ITemplate<T> {
    this.trace(`getElementTemplate`, definition, componentType);
    return this.elementTemplate as unknown as ITemplate<T>;
  }

  public getViewFactory<T extends INode = INode>(
    dom: IDOM<T>,
    source: ITemplateDefinition,
    parentContext: IRenderContext<T> | null,
  ): IViewFactory<T> {
    this.trace(`getViewFactory`, source, parentContext);
    return this.viewFactory as unknown as IViewFactory<T>;
  }

  public createRenderer(context: IRenderContext): IRenderer {
    this.trace(`createRenderer`, context);
    return this.renderer;
  }

  public applyRuntimeBehavior(flags: LifecycleFlags, type: IResourceType<IAttributeDefinition, ICustomAttribute>, instance: ICustomAttribute): void;
  public applyRuntimeBehavior(flags: LifecycleFlags, type: ICustomElementType, instance: ICustomElement): void;
  public applyRuntimeBehavior(flags: LifecycleFlags, type: any, instance: any) {
    this.trace(`applyRuntimeBehavior`, type, instance);
    this.runtimeBehaviorApplicator(type, instance);
  }

  public trace(fnName: keyof MockRenderingEngine, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }

}
export class MockBrowserHistoryLocation {
  public changeCallback?: () => void;

  private readonly states: Record<string, unknown>[] = [{}];
  private readonly paths: string[] = [''];
  private index: number = 0;

  get length(): number {
    return this.states.length;
  }
  get state(): Record<string, unknown> {
    return this.states[this.index];
  }
  get path(): string {
    return this.paths[this.index];
  }

  get pathname(): string {
    const parts = this.parts;
    // parts.shift();
    return parts.shift()!;
  }
  get search(): string {
    const parts = this.parts;
    // if (parts.shift()) {
    //   parts.shift();
    // }
    parts.shift();
    const part: string = parts.shift()!;
    return part !== undefined ? `?${part}` : '';
  }
  get hash(): string {
    const parts = this.parts;
    // if (!parts.shift()) {
    //   parts.shift();
    // }
    parts.shift();
    parts.shift();
    const part: string = parts.shift()!;
    return part !== undefined ? `#${part}` : '';
  }
  set hash(value: string) {
    if (value.startsWith('#')) {
      value = value.substring(1);
    }
    const parts = this.parts;
    // const hashFirst = parts.shift();
    let path = parts.shift();
    // if (hashFirst) {
    //   parts.shift();
    //   path += `#${value}`;
    //   const part = parts.shift();
    //   if (part !== undefined) {
    //     path += `?${part}`;
    //   }
    // } else {
    const part = parts.shift();
    if (part !== undefined) {
      path += `?${part}`;
    }
    parts.shift();
    path += `#${value}`;
    // }

    this.pushState({}, null!, path!);
    this.notifyChange();
  }

  public activate(callback: Function): void { }
  public deactivate(): void { }

  // TODO: Fix a better split
  private get parts(): string[] {
    const parts = [];
    const ph = this.path.split('#');
    if (ph.length > 1) {
      parts.unshift(ph.pop());
    } else {
      parts.unshift(undefined);
    }
    const pq = ph[0].split('?');
    if (pq.length > 1) {
      parts.unshift(pq.pop());
    } else {
      parts.unshift(undefined);
    }
    parts.unshift(pq[0]);
    // const parts: (string | boolean)[] = this.path.split(/[#?]/);
    // let search = this.path.indexOf('?') >= 0 ? this.path.indexOf('?') : 99999;
    // let hash = this.path.indexOf('#') >= 0 ? this.path.indexOf('#') : 99999;
    // parts.unshift(hash < search);
    return parts as string[];
  }

  public pushState(data: Record<string, unknown>, title: string, path: string) {
    this.states.splice(this.index + 1);
    this.paths.splice(this.index + 1);
    this.states.push(data);
    this.paths.push(path);
    this.index++;
  }

  public replaceState(data: Record<string, unknown>, title: string, path: string) {
    this.states[this.index] = data;
    this.paths[this.index] = path;
  }

  public go(movement: number) {
    const newIndex = this.index + movement;
    if (newIndex >= 0 && newIndex < this.states.length) {
      this.index = newIndex;
      this.notifyChange();
    }
  }

  private notifyChange() {
    if (this.changeCallback) {
      console.log('MOCK: notifyChange', this.path, this.state);
      this.changeCallback();
    }
  }
}


export class SpySubscriber {
  public handleChange: ReturnType<typeof spy>;
  public handleBatchedChange: ReturnType<typeof spy>;
  constructor() {
    this.handleChange = spy();
    this.handleBatchedChange = spy();
  }
  public resetHistory() {
    this.handleChange.resetHistory();
    this.handleBatchedChange.resetHistory();
  }
}
