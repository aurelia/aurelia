import { DI, IContainer, IIndexable } from '@aurelia/kernel';
import { astBind, astEvaluate, astUnbind, ExpressionType, IAstEvaluator, IBinding, IConnectableBinding, IExpressionParser, Scope, type IsBindingBehavior } from '@aurelia/runtime';
import { AppTask, bindingCommand, BindingCommandInstance, CommandType, ICommandBuildInfo, IEventTarget, IHydratableController, IInstruction, InstructionType, IRenderer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited, renderer } from '@aurelia/runtime-html';
import { createLookup, ensureExpression, isFunction } from './utilities';

import type { IDisposable, IServiceLocator } from '@aurelia/kernel';

const registeredSymbol = Symbol('.delegate');

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export const delegateSyntax = {
  register(container: IContainer) {
    /* istanbul ignore next */
    if (!(container as unknown as IIndexable)[registeredSymbol]) {
      /* istanbul ignore next */
      (container as unknown as IIndexable)[registeredSymbol] = true;
      container.register(
        IEventDelegator,
        DelegateBindingCommand,
        ListenerBindingRenderer
      );
    }
  }
};

const instructionType = 'dl';

@bindingCommand('delegate')
export class DelegateBindingCommand implements BindingCommandInstance {
  public get type(): CommandType.IgnoreAttr { return CommandType.IgnoreAttr; }

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IInstruction {
    return new DelegateBindingInstruction(
      exprParser.parse(info.attr.rawValue, ExpressionType.IsFunction),
      info.attr.target,
      false
    );
  }
}

@renderer(instructionType)
/** @internal */
export class ListenerBindingRenderer implements IRenderer {
  /** @internal */ protected static get inject() { return [IExpressionParser, IEventDelegator]; }
  /** @internal */ private readonly _exprParser: IExpressionParser;

  public readonly target!: 'dl';
  /** @internal */
  private readonly _eventDelegator: IEventDelegator;

  public constructor(
    parser: IExpressionParser,
    eventDelegator: IEventDelegator,
  ) {
    this._exprParser = parser;
    this._eventDelegator = eventDelegator;
  }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: DelegateBindingInstruction,
  ): void {
    const expr = ensureExpression(this._exprParser, instruction.from, ExpressionType.IsFunction);
    renderingCtrl.addBinding(new DelegateListenerBinding(
      renderingCtrl.container,
      expr,
      target,
      instruction.to,
      this._eventDelegator,
      new DelegateListenerOptions(instruction.preventDefault),
    ));
  }
}

export class DelegateBindingInstruction {
  public readonly type = InstructionType.listenerBinding;

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

export interface DelegateListenerBinding extends IAstEvaluator, IConnectableBinding { }
/**
 * Listener binding. Handle event binding between view and view model
 */
export class DelegateListenerBinding implements IBinding {
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

mixinUseScope(DelegateListenerBinding);
mixingBindingLimited(DelegateListenerBinding, () => 'callSource');
mixinAstEvaluator(true, true)(DelegateListenerBinding);

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
export const IEventDelegator = DI.createInterface<IEventDelegator>('IEventDelegator', x => x.cachedCallback((handler) => {
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
