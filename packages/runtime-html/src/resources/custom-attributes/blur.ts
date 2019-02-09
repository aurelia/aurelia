import { IContainer, IRegistry, PLATFORM, Registration } from '@aurelia/kernel';
import { AttributeDefinition, bindable, BindingMode, CustomAttributeResource, IAttributeDefinition, IBindableDescription, ICustomAttributeResource, INode, IObservable } from '@aurelia/runtime';
import { addListener, removeListener } from './utils';

// tslint:disable
// let useTouch = false;
let useMouse = false;
// let usePointer = false;
// let useFocus = false;
const enum Listeners {
  touch = 1,
  mouse = 2,
  pointer = 4,
  blur = 8,
  focus = 16,
  wheel = 32
}

let usage: Listeners = 0;

const checkTargets: BlurCustomAttribute[] = [];
const unset = Symbol();

export interface BlurListenerConfig {
  touch?: boolean;
  mouse?: boolean;
  pointer?: boolean;
  focus?: boolean;
  windowBlur?: boolean;
  wheel?: boolean;
}

export interface IBlurCustomAttributeListeners {
  touch(on: boolean): IBlurCustomAttributeListeners;
  mouse(on: boolean): IBlurCustomAttributeListeners;
  pointer(on: boolean): IBlurCustomAttributeListeners;
  focus(on: boolean): IBlurCustomAttributeListeners;
  blur(on: boolean): IBlurCustomAttributeListeners;
  wheel(on: boolean): IBlurCustomAttributeListeners;
}

const defaultCaptureEventInit: AddEventListenerOptions = {
  passive: true,
  capture: true
};
const defaultBubbleEventInit: AddEventListenerOptions = {
  passive: true
};

export class BlurCustomAttribute {

  public static register: IRegistry['register'];
  public static bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  public static inject: unknown[] = [INode];

  public static readonly listen: IBlurCustomAttributeListeners = {
    touch(on: boolean): IBlurCustomAttributeListeners {
      usage = on ? (usage | Listeners.touch) : (usage & ~Listeners.touch);
      const fn = on ? addListener : removeListener;
      fn(document, 'touchstart', handleTouchStart, defaultCaptureEventInit);
      return BlurCustomAttribute.listen;
    },
    mouse(on: boolean): IBlurCustomAttributeListeners {
      usage = on ? (usage | Listeners.mouse) : (usage & ~Listeners.mouse);
      const fn = on ? addListener : removeListener;
      fn(document, 'mousedown', handleMousedown, defaultCaptureEventInit);
      return BlurCustomAttribute.listen;
    },
    pointer(on: boolean): IBlurCustomAttributeListeners {
      usage = on ? (usage | Listeners.pointer) : (usage & ~Listeners.pointer);
      const fn = on ? addListener : removeListener;
      fn(document, 'pointerdown', handlePointerDown, defaultCaptureEventInit);
      return BlurCustomAttribute.listen;
    },
    focus(on: boolean): IBlurCustomAttributeListeners {
      usage = on ? (usage | Listeners.focus) : (usage & ~Listeners.focus);
      const fn = on ? addListener : removeListener;
      fn(window, 'focus', handleWindowFocus, defaultCaptureEventInit);
      return BlurCustomAttribute.listen;
    },
    blur(on: boolean): IBlurCustomAttributeListeners {
      usage = on ? (usage | Listeners.blur) : (usage & ~Listeners.blur);
      const fn = on ? addListener : removeListener;
      fn(window, 'blur', handleWindowBlur);
      return BlurCustomAttribute.listen;
    },
    wheel(on: boolean): IBlurCustomAttributeListeners {
      usage = on ? (usage | Listeners.wheel) : (usage & ~Listeners.wheel);
      const fn = on ? addListener : removeListener;
      fn(window, 'wheel', handleMouseWheel, defaultBubbleEventInit);
      return BlurCustomAttribute.listen;
    }
  }

  public static use(cfg: BlurListenerConfig): void {
    const blurListeners = BlurCustomAttribute.listen;
    for (const prop in cfg) {
      if (prop in blurListeners) {
        (blurListeners)[prop]((cfg)[prop]);
      }
    }
  }

  public value: boolean | typeof unset;

  public onBlur: () => void;

  /**
   * Used to determine which elemens this attribute will be linked with
   * Interacting with a linked element will not trigger blur for this attribute
   */
  public linkedWith: string | Element | (string | Element)[];

  /**
   * Only used when linkedWith is a string.
   * Used to determine whether to use querySelector / querySelectorAll to find all interactable elements without triggering blur
   * Performace wise Consider using this only when necessary
   */
  public linkedMultiple: boolean;

  /**
   * Only used when linkedWith is a string, or an array containing some strings
   * During query for finding element to link with:
   * - true: search all children, using `querySelectorAll`
   * - false: search immediate children using for loop
   */
  public searchSubTree: boolean;

  /**
   * Only used when linkedWith is a string. or an array containing a string
   * Determine from which node/ nodes, search for elements
   */
  public linkingContext: string | Element | null;

  constructor(private element: Element) {
    /**
     * By default, the behavior should be least surprise possible, that:
     * 
     * it searches for anything from root context,
     * and root context is document body
     */
    this.linkedMultiple = true;
    this.searchSubTree = true;
    this.linkingContext = null;
    this.value = unset;
  }

  public binding() {
    checkTargets.push(this);
  }

  public unbinding() {
    const idx = checkTargets.indexOf(this);
    if (idx !== -1) {
      checkTargets.splice(idx, 1);
    }
  }

  public handleEventTarget(target: EventTarget): void {
    if (this.value === false) {
      return;
    }
    if (target === (PLATFORM.global as unknown) || !this.contains(target as Element)) {
      this.triggerBlur();
    }
  }

  public contains(target: Element): boolean {
    if (!this.value) {
      return false;
    }
    let els: ArrayLike<Element>;
    let el: string | Element | { contains(el: Element): boolean };
    let i: number, ii: number;
    let j: number, jj: number;
    let links: string | Element | (string | Element)[];
    let contextNode: Element | null;

    if (this.element.contains(target)) {
      return true;
    }

    if (!this.linkedWith) {
      return false;
    }

    const doc = document;
    const linkedWith = this.linkedWith;
    const linkingContext = this.linkingContext;

    links = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
    contextNode = (typeof linkingContext === 'string'
        ? doc.querySelector(linkingContext)
        : linkingContext
      )
      || document.body;

    for (i = 0, ii = links.length; i < ii; ++i) {
      el = links[i];
      // When user specify to link with something by a string, it acts as a CSS selector
      // We need to do some querying stuff to determine if target above is contained.
      if (typeof el === 'string') {
        // Default behavior, search the whole tree, from context that user specified, which default to document body
        // Function `query` used will be similar to `querySelectorAll`, but optimized for performant
        if (this.searchSubTree) {
          els = contextNode!.querySelectorAll(el);
          for (j = 0, jj = els.length; j < jj; ++j) {
            if (els[j].contains(target)) {
              return true;
            }
          }
        } else {
          // default to document body, if user didn't define a linking context, and wanted to ignore subtree.
          // This is specifically performant and useful for dialogs, plugins
          // that usually generate contents to document body
          els = contextNode!.children;
          for (j = 0, jj = els.length; j < jj; ++j) {
            if ((els as Element[])[j].matches(el)) {
              return true;
            }
          }
        }
      } else {
        // When user passed in something that is not a string,
        // simply check if has method `contains` (allow duck typing)
        // and call it against target.
        // This enables flexible usages
        if (el && el.contains(target)) {
          return true;
        }
      }
    }
    return false;
  }

  public triggerBlur(): void {
    this.value = false;
    if (typeof this.onBlur === 'function') {
      this.onBlur.call(null);
    }
  }
}

CustomAttributeResource.define({
  name: 'blur',
  hasDynamicOptions: true
}, BlurCustomAttribute);

BlurCustomAttribute.register = function(container: IContainer): void {
  BlurCustomAttribute.use({
    mouse: true,
    focus: true,
    touch: true,
    windowBlur: true,
  });
  container.register(Registration.transient(CustomAttributeResource.keyFrom('blur'), this));
};

BlurCustomAttribute.bindables = ['onBlur', 'linkedWith', 'linkMultiple', 'searchSubTree'].reduce((bindables, prop) => {
  bindables[prop] = { property: prop, attribute: PLATFORM.kebabCase(prop) };
  return bindables;
}, {
  value: { property: 'value', attribute: 'value', mode: BindingMode.twoWay }
} as Record<string, IBindableDescription>);

/*******************************
 * EVENTS ORDER
 * -----------------------------
 * pointerdown
 * touchstart
 * pointerup
 * touchend
 * mousedown
 * --------------
 * BLUR
 * FOCUS
 * --------------
 * mouseup
 * click
 ******************************/

/**
 * In which case focus happens without mouse interaction? Keyboard
 * So it needs to capture both mouse / focus movement
 */


let checkage = 0;

const handlePointerDown = (e: PointerEvent): void => {
  if ((checkage & Listeners.pointer) > 0) {
    // add touch and mouse flags to the checkage only if they are present on usage, and always remove the pointer flag
    checkage = checkage | (usage & (Listeners.touch | Listeners.mouse)) & ~Listeners.pointer;
    return;
  }
  handleEvent(e);
  checkage &= ~Listeners.pointer;
}

const handleTouchStart = (e: TouchEvent): void => {
  if ((checkage & Listeners.touch) > 0) {
    // add mouse flag to checkage only if they are present on usage, and always remove touch flag
    checkage |= usage & Listeners.mouse & ~Listeners.touch;
    return;
  }
  handleEvent(e);
  checkage &= ~Listeners.touch;
}

const handleMousedown = (e: MouseEvent): void => {
  if ((checkage & Listeners.mouse) > 0) {
    checkage &= ~Listeners.mouse;
    return;
  }
  handleEvent(e);
  checkage &= ~Listeners.mouse;
}

/**
 * Handle globally captured focus event
 */
const handleWindowFocus = (e: FocusEvent): void => {
  // there are two way a focus gets captured on window
  // when the windows itself got focus
  // and when an element in the document gets focus
  // when the window itself got focus, reacting to it is quite unnecessary
  // as it doesn't really affect element inside the document
  // Do a simple check and bail immediately
  if (e.target === PLATFORM.global as unknown) {
    checkage = 0;
    return;
  }
  if ((checkage & Listeners.focus) > 0) {
    checkage &= ~Listeners.focus;
    return;
  }
  handleEvent(e);
  checkage &= ~Listeners.focus;
}

const handleWindowBlur = (): void => {
  checkage = 0;
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    checkTargets[i].triggerBlur();
  }
}

const handleMouseWheel = (e: WheelEvent): void => {
  handleEvent(e);
}

const handleEvent = (e: Event): void => {
  const target = e.target;
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    checkTargets[i].handleEventTarget(target);
  }
}
