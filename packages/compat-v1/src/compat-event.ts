import { createLookup, DI, IContainer, isFunction, resolve } from '@aurelia/kernel';
import {
  IObserverLocatorBasedConnectable,
  astBind,
  astEvaluate,
  astUnbind,
  type IAstEvaluator,
  // type IBinding,
  type Scope,
} from '@aurelia/runtime';
import {
  AppTask,
  IEventTarget,
  type IHydratableController,
  IRenderer,
  mixinAstEvaluator,
  mixinUseScope,
  mixingBindingLimited,
  renderer,
  IPlatform,
  IListenerBindingOptions,
  type IBinding,
} from '@aurelia/runtime-html';
import {
  type BindingCommandInstance,
  type ICommandBuildInfo,
  type IInstruction,
  type BindingCommandStaticAuDefinition,
} from '@aurelia/template-compiler';
import { ensureExpression, etIsFunction } from './utilities';
import { IExpressionParser, IsBindingBehavior } from '@aurelia/expression-parser';

import type { IDisposable, IServiceLocator } from '@aurelia/kernel';

const preventDefaultRegisteredContainer = new WeakSet<IContainer>();
export const eventPreventDefaultBehavior = {
  /* istanbul ignore next */
  register(container: IContainer) {
    if (preventDefaultRegisteredContainer.has(container)) {
      return;
    }
    preventDefaultRegisteredContainer.add(container);
    container.get(IListenerBindingOptions).prevent = true;
  }
};

const delegateRegisteredContainer = new WeakSet<IContainer>();

export const delegateSyntax = {
  /* istanbul ignore next */
  register(container: IContainer) {
    if (!delegateRegisteredContainer.has(container)) {
      delegateRegisteredContainer.add(container);
      container.register(
        IEventDelegator,
        DelegateBindingCommand,
        ListenerBindingRenderer
      );
    }
  }
};

export class DelegateBindingCommand implements BindingCommandInstance {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: 'binding-command',
    name: 'delegate',
  };
  public get ignoreAttr() { return true; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new DelegateBindingInstruction(
      exprParser.parse(info.attr.rawValue, etIsFunction),
      info.attr.target,
      true,
    );
  }
}

/** @internal */
export const ListenerBindingRenderer = /*@__PURE__*/ renderer(class ListenerBindingRenderer implements IRenderer {

  public readonly target = 'dl';
  /** @internal */
  private readonly _eventDelegator = resolve(IEventDelegator);

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: DelegateBindingInstruction,
    platform: IPlatform,
    exprParser: IExpressionParser,
  ): void {
    const expr = ensureExpression(exprParser, instruction.from, etIsFunction);
    renderingCtrl.addBinding(new DelegateListenerBinding(
      renderingCtrl.container,
      expr,
      target,
      instruction.to,
      this._eventDelegator,
      new DelegateListenerOptions(instruction.preventDefault),
    ));
  }
}, null!);

export class DelegateBindingInstruction implements IInstruction {
  public readonly type = 'dl';

  public constructor(
    public from: string | IsBindingBehavior,
    public to: string,
    public preventDefault: boolean,
  ) { }
}

export class DelegateListenerOptions {
  public constructor(
    public readonly prevent: boolean,
  ) { }
}

export interface DelegateListenerBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
/**
 * Listener binding. Handle event binding between view and view model
 */
export class DelegateListenerBinding implements IBinding {
  static {
    mixinUseScope(DelegateListenerBinding);
    mixingBindingLimited(DelegateListenerBinding, () => 'callSource');
    mixinAstEvaluator(DelegateListenerBinding);
  }

  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope;

  private handler: IDisposable = null!;
  /** @internal */
  private readonly _options: DelegateListenerOptions;

  /** @internal */
  public l: IServiceLocator;

  /**
   * Indicates if this binding evaluates an ast and get a function, that function should be bound
   * to the instance it is on
   *
   * @internal
   */
  public readonly boundFn = true;

  public self: boolean = false;

  public constructor(
    locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: Node,
    public targetEvent: string,
    public eventDelegator: IEventDelegator,
    options: DelegateListenerOptions,
  ) {
    this.l = locator;
    this._options = options;
  }

  public callSource(event: Event): unknown {
    const overrideContext = this._scope!.overrideContext;
    overrideContext.$event = event;

    let result = astEvaluate(this.ast, this._scope!, this, null);

    delete overrideContext.$event;

    if (isFunction(result)) {
      result = result(event);
    }

    if (result !== true && this._options.prevent) {
      event.preventDefault();
    }

    return result;
  }

  public handleEvent(event: Event): void {
    if (this.self) {
      /* istanbul ignore next */
      if (this.target !== event.composedPath()[0]) {
        return;
      }
    }
    this.callSource(event);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      if (this._scope === _scope) {
        return;
      }
      this.unbind();
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    this.handler = this.eventDelegator.addEventListener(
      this.l.get(IEventTarget),
      this.target,
      this.targetEvent,
      this,
    );

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.handler.dispose();
    this.handler = null!;
  }
}

const defaultOptions: AddEventListenerOptions = {
  capture: false,
};

class ListenerTracker implements IDisposable {
  private _count: number = 0;
  private readonly _captureLookups: Map<EventTarget, Record<string, EventListenerOrEventListenerObject | undefined>> = new Map();
  private readonly _bubbleLookups: Map<EventTarget, Record<string, EventListenerOrEventListenerObject | undefined>> = new Map();

  public constructor(
    private readonly _publisher: EventTarget,
    private readonly _eventName: string,
    private readonly _options = defaultOptions,
  ) { }

  public _increment(): void {
    if (++this._count === 1) {
      this._publisher.addEventListener(this._eventName, this, this._options);
    }
  }

  public _decrement(): void {
    if (--this._count === 0) {
      this._publisher.removeEventListener(this._eventName, this, this._options);
    }
  }

  public dispose(): void {
    if (this._count > 0) {
      this._count = 0;
      this._publisher.removeEventListener(this._eventName, this, this._options);
    }
    this._captureLookups.clear();
    this._bubbleLookups.clear();
  }

  public _getLookup(target: EventTarget): Record<string, EventListenerOrEventListenerObject | undefined> {
    const lookups = this._options.capture === true ? this._captureLookups : this._bubbleLookups;
    let lookup = lookups.get(target);
    if (lookup === void 0) {
      lookups.set(target, lookup = createLookup());
    }
    return lookup;
  }

  public handleEvent(event: Event): void {
    const lookups = this._options.capture === true ? this._captureLookups : this._bubbleLookups;
    const path = event.composedPath();
    if (this._options.capture === true) {
      path.reverse();
    }
    for (const target of path) {
      const lookup = lookups.get(target);
      if (lookup === void 0) {
        continue;
      }
      const listener = lookup[this._eventName];
      if (listener === void 0) {
        continue;
      }
      if (isFunction(listener)) {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
      if (event.cancelBubble === true) {
        return;
      }
    }
  }
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegateSubscription implements IDisposable {
  public constructor(
    private readonly _tracker: ListenerTracker,
    private readonly _lookup: Record<string, EventListenerOrEventListenerObject | undefined>,
    private readonly _eventName: string,
    callback: EventListenerOrEventListenerObject
  ) {
    _tracker._increment();
    _lookup[_eventName] = callback;
  }

  public dispose(): void {
    this._tracker._decrement();
    this._lookup[this._eventName] = void 0;
  }
}

export interface IEventDelegator extends EventDelegator { }
export const IEventDelegator = /*@__PURE__*/DI.createInterface<IEventDelegator>('IEventDelegator', x => x.cachedCallback((handler) => {
  const instance = handler.invoke(EventDelegator);
  handler.register(AppTask.deactivating(() => instance.dispose()));
  return instance;
}));

export class EventDelegator implements IDisposable {
  /** @internal */
  private readonly _trackerMaps: Record<string, Map<EventTarget, ListenerTracker> | undefined> = createLookup();

  public addEventListener(
    publisher: EventTarget,
    target: Node,
    eventName: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
  ): IDisposable {
    const trackerMap = this._trackerMaps[eventName] ??= new Map<EventTarget, ListenerTracker>();
    let tracker = trackerMap.get(publisher);
    if (tracker === void 0) {
      trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
    }
    return new DelegateSubscription(tracker, tracker._getLookup(target), eventName, listener);
  }

  public dispose(): void {
    for (const eventName in this._trackerMaps) {
      const trackerMap = this._trackerMaps[eventName]!;
      for (const tracker of trackerMap.values()) {
        tracker.dispose();
      }
      trackerMap.clear();
    }
  }
}
