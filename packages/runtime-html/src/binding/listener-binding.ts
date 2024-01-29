import { isArray, isFunction, isString } from '../utilities';
import { createInterface, singletonRegistration } from '../utilities-di';
import { mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import { resolve, type IServiceLocator, all, IContainer } from '@aurelia/kernel';
import { astBind, astEvaluate, astUnbind, IAstEvaluator, IBinding, IConnectableBinding, Scope, type IsBindingBehavior } from '@aurelia/runtime';

export class ListenerBindingOptions {
  public constructor(
    public readonly prevent: boolean,
    public readonly capture: boolean = false,
  ) {}
}

export interface ListenerBinding extends IAstEvaluator, IConnectableBinding {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class ListenerBinding implements IBinding {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope;

  /** @internal */
  private readonly _options: ListenerBindingOptions;

  /** @internal */
  public l: IServiceLocator;

  /**
   * Whether this binding only handles events originate from the target this binding is bound to
   */
  public self: boolean = false;

  /**
   * Indicates if this binding evaluates an ast and get a function, that function should be bound
   * to the instance it is on
   *
   * @internal
   */
  public readonly boundFn = true;

  /** @internal */
  private readonly _modifiedEventHandler: ModifiedEventVerifier | null = null;

  public constructor(
    locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: Node,
    public targetEvent: string,
    options: ListenerBindingOptions,
    modifiedEventHandler: ModifiedEventVerifier | null,
  ) {
    this.l = locator;
    this._options = options;
    this._modifiedEventHandler = modifiedEventHandler;
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
      if (this.target !== event.composedPath()[0]) {
      /* istanbul-ignore-next */
        return;
      }
    }
    if (this._modifiedEventHandler?.(event) !== false) {
      this.callSource(event);
    }
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) {
      /* istanbul-ignore-next */
        return;
      }
      this.unbind();
    }
    this._scope = scope;

    astBind(this.ast, scope, this);

    this.target.addEventListener(this.targetEvent, this, this._options);

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.target.removeEventListener(this.targetEvent, this, this._options);
  }
}

mixinUseScope(ListenerBinding);
mixingBindingLimited(ListenerBinding, () => 'callSource');
mixinAstEvaluator(true, true)(ListenerBinding);

export type ModifiedEventVerifier = (event: Event) => boolean;

export interface IEventModifier {
  readonly type: string | string[];
  getHandler(modifier: string): ModifiedEventVerifier;
}
export const IEvenModifier = createInterface<IEventModifier>('IEventModifier');

export interface IKeyMapping {
  readonly meta: string[];
  readonly keys: Record<string, number>;
}
export const IKeyMapping = createInterface<IKeyMapping>('IKeyMapping', x => x.instance({
  meta: ['ctrl', 'alt', 'shift', 'meta'],
  keys: {
    escape: 27,
    enter: 13,
    space: 32,
    tab: 9,
  },
}));

class MouseEventModifier implements IEventModifier {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IEvenModifier, MouseEventModifier));
  }

  public readonly type = ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu'];
  /** @internal */
  private readonly _mapping = resolve(IKeyMapping);
  /** @internal */
  private readonly _mouseButtons = ['left', 'middle', 'right'];

  public getHandler(modifier: string): ModifiedEventVerifier {
    const modifiers = modifier.split(/[:+.]/);
    if (__DEV__) {
      // verify modifiers and add warnings if necessary
    }
    return ((event: MouseEvent) => {
      let prevent = false;
      let stop = false;
      let m: string;

      for (m of modifiers) {
        switch (m) {
          case 'prevent': prevent = true; continue;
          case 'stop': stop = true; continue;
          case 'left':
          case 'middle':
          case 'right':
            if (event.button !== this._mouseButtons.indexOf(m)) return false;
            continue;
        }
        if (this._mapping.meta.includes(m) && event[`${m}Key` as keyof MouseEvent] !== true) {
          return false;
        }
      }

      if (prevent) event.preventDefault();
      if (stop) event.stopPropagation();

      return true;
    }) as ModifiedEventVerifier;
  }
}

class KeyboardEventModifier implements IEventModifier {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IEvenModifier, KeyboardEventModifier));
  }

  /** @internal */
  private readonly _mapping = resolve(IKeyMapping);
  public readonly type = ['keydown', 'keyup'];
  public getHandler(modifier: string): ModifiedEventVerifier {
    const modifiers = modifier.split(/[:+.]/);
    if (__DEV__) {
      // verify modifiers and add warnings if necessary
    }

    return ((event: KeyboardEvent) => {
      let prevent = false;
      let stop = false;
      let keyCode = 0;
      let m: string;

      for (m of modifiers) {
        switch (m) {
          case 'prevent': prevent = true; continue;
          case 'stop': stop = true; continue;
        }
        if (this._mapping.meta.includes(m)) {
          if (event[`${m}Key` as keyof KeyboardEvent] !== true) {
            return false;
          }
          continue;
        }
        if ((keyCode = Number(m)) > 0) {
          if (this._mapping.keys[event.key] !== keyCode) {
            return false;
          }
          continue;
        }

        if (event.key !== m) {
          return false;
        }
      }

      if (prevent) event.preventDefault();
      if (stop) event.stopPropagation();

      return true;
    }) as ModifiedEventVerifier;
  }
}

export interface IEventModifierHandler {
  getHandler(type: string, modifier: string | null): ModifiedEventVerifier | null;
}
export const IEventModifierHandler = createInterface<IEventModifierHandler>('IEventModifierHandler', x => x.instance({
  getHandler: () => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('No event modifier handler registered');
    }
    return null;
  }
}));

export class EventModifierHandler implements IEventModifierHandler {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IEventModifierHandler, EventModifierHandler));
  }
  /** @internal */
  private readonly _reg = resolve(all(IEvenModifier))
    .reduce((acc: Record<string, IEventModifier>, cur) => {
      const types = isArray(cur.type) ? cur.type : [cur.type];
      types.forEach(t => acc[t] = cur);
      return acc;
    }, {});

  public getHandler(type: string, modifier: string | null): ModifiedEventVerifier | null {
    return isString(modifier) ? this._reg[type]?.getHandler(modifier) ?? null : null;
  }
}

export const EventModifierRegistration = {
  register(c: IContainer) {
    c.register(
      EventModifierHandler,
      MouseEventModifier,
      KeyboardEventModifier,
    );
  }
};
