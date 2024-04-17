import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { isArray, isFunction, isString, objectFreeze } from '../utilities';
import { createInterface, singletonRegistration } from '../utilities-di';
import { mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import { resolve, type IServiceLocator, all, IContainer } from '@aurelia/kernel';
import { ICollectionSubscriber, IObserverLocatorBasedConnectable, ISubscriber, } from '@aurelia/runtime';
import { type Scope } from './scope';
import { astBind, astEvaluate, astUnbind, IAstEvaluator } from '../ast.eval';
import { IBinding } from './interfaces-bindings';

export class ListenerBindingOptions {
  public constructor(
    public readonly prevent: boolean,
    public readonly capture: boolean = false,
  ) {}
}

export interface ListenerBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class ListenerBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  static {
    mixinUseScope(ListenerBinding);
    mixingBindingLimited(ListenerBinding, () => 'callSource');
    mixinAstEvaluator(true, true)(ListenerBinding);
  }

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
  private readonly _modifiedEventHandler: IModifiedEventHandler | null = null;

  public constructor(
    locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: Node,
    public targetEvent: string,
    options: ListenerBindingOptions,
    modifiedEventHandler: IModifiedEventHandler | null,
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

export type IModifiedEventHandler = (event: Event) => boolean;

export interface IModifiedEventHandlerCreator {
  readonly type: string | string[];
  getHandler(modifier: string): IModifiedEventHandler;
}
export const IModifiedEventHandlerCreator = /*@__PURE__*/createInterface<IModifiedEventHandlerCreator>('IEventModifier');

export interface IKeyMapping {
  readonly meta: string[];
  readonly keys: Record</* modifier */string, /* key */ string>;
}
export const IKeyMapping = /*@__PURE__*/createInterface<IKeyMapping>('IKeyMapping', x => x.instance({
  meta: objectFreeze(['ctrl', 'alt', 'shift', 'meta']) as string[],
  keys: {
    escape: 'Escape',
    enter: 'Enter',
    space: 'Space',
    tab: 'tab',
    // by default, maps the key a-z and A-Z to their respective keycodes
    ...Array.from({ length: 25 }).reduce((acc: Record<string, string>, _, idx) => {
      // map keycode of upper case character from A-Z
      let char = String.fromCharCode(idx + 65);
      acc[idx + 65] = char;

      // map keycode and character code of lower case character from a-z
      char = String.fromCharCode(idx + 97);
      acc[idx + 97] = acc[char] = char;
      return acc;
    }, {})
  },
}));

class ModifiedMouseEventHandler implements IModifiedEventHandlerCreator {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IModifiedEventHandlerCreator, ModifiedMouseEventHandler));
  }

  public readonly type = ['click', 'mousedown', 'mousemove', 'mouseup', 'dblclick', 'contextmenu'];
  /** @internal */
  private readonly _mapping = resolve(IKeyMapping);
  /** @internal */
  private readonly _mouseButtons = ['left', 'middle', 'right'];

  public getHandler(modifier: string): IModifiedEventHandler {
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

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`Modifier '${m}' is not supported for mouse events.`);
        }
      }

      if (prevent) event.preventDefault();
      if (stop) event.stopPropagation();

      return true;
    }) as IModifiedEventHandler;
  }
}

class ModifiedKeyboardEventHandler implements IModifiedEventHandlerCreator {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IModifiedEventHandlerCreator, ModifiedKeyboardEventHandler));
  }

  /** @internal */
  private readonly _mapping = resolve(IKeyMapping);
  public readonly type = ['keydown', 'keyup'];
  public getHandler(modifier: string): IModifiedEventHandler {
    const modifiers = modifier.split(/[:+.]/);
    return ((event: KeyboardEvent) => {
      let prevent = false;
      let stop = false;
      let mod: string;

      for (mod of modifiers) {
        switch (mod) {
          case 'prevent': prevent = true; continue;
          case 'stop': stop = true; continue;
        }
        if (this._mapping.meta.includes(mod)) {
          if (event[`${mod}Key` as keyof KeyboardEvent] !== true) {
            return false;
          }
          continue;
        }

        const mappedKey = this._mapping.keys[mod];
        if (mappedKey !== event.key) {
          return false;
        }

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`Modifier '${mod}' is not supported for keyboard event with key "${event.key}".`);
        }
      }

      if (prevent) event.preventDefault();
      if (stop) event.stopPropagation();

      return true;
    }) as IModifiedEventHandler;
  }
}

export interface IEventModifier {
  getHandler(type: string, modifier: string | null): IModifiedEventHandler | null;
}
export const IEventModifier = /*@__PURE__*/createInterface<IEventModifier>('IEventModifierHandler', x => x.instance({
  getHandler: () => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('No event modifier handler registered');
    }
    /* istanbul ignore next */
    return null;
  }
}));

export class EventModifier implements IEventModifier {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IEventModifier, EventModifier));
  }
  /** @internal */
  private readonly _reg = resolve(all(IModifiedEventHandlerCreator))
    .reduce((acc: Record<string, IModifiedEventHandlerCreator>, cur) => {
      const types = isArray(cur.type) ? cur.type : [cur.type];
      types.forEach(t => acc[t] = cur);
      return acc;
    }, {});

  public getHandler(type: string, modifier: string | null): IModifiedEventHandler | null {
    return isString(modifier) ? this._reg[type]?.getHandler(modifier) ?? null : null;
  }
}

export const EventModifierRegistration = {
  register(c: IContainer) {
    c.register(
      EventModifier,
      ModifiedMouseEventHandler,
      ModifiedKeyboardEventHandler,
    );
  }
};
