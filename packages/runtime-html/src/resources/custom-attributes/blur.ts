import { IRegistry, PLATFORM } from '@aurelia/kernel';
import {
  AttributeDefinition,
  BindingMode,
  CustomAttributeResource,
  IAttributeDefinition,
  IBindableDescription,
  ICustomAttributeResource,
  IDOM,
  INode,
  IObservable
} from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
import { addListener, removeListener } from './utils';

const enum Listeners {
  touch = 1,
  mouse = 2,
  pointer = 4,
  blur = 8,
  focus = 16,
  wheel = 32
}

const usage: Listeners = 63;
const unset = Symbol();

// Using passive to help with performance
const defaultCaptureEventInit: AddEventListenerOptions = {
  passive: true,
  capture: true
};
// Using passive to help with performance
const defaultBubbleEventInit: AddEventListenerOptions = {
  passive: true
};
// weakly connect a document to a blur manager
// to avoid polluting the document properties
const blurDocMap = new WeakMap<Document, BlurManager>();

export class BlurManager {
  public readonly dom: HTMLDOM;

  private blurs: BlurCustomAttribute[];
  private handler: EventListenerObject;

  private constructor(dom: HTMLDOM) {
    blurDocMap.set(dom.document, this);
    this.dom = dom;
    this.blurs = [];
    this.handler = createHandler(this, this.blurs);
  }

  public static init(dom: HTMLDOM): BlurManager {
    return blurDocMap.get(dom.document) || new BlurManager(dom);
  }

  public register(blur: BlurCustomAttribute): void {
    const blurs = this.blurs;
    if (blurs.indexOf(blur) === -1 && blurs.push(blur) === 1) {
      this.addListeners();
    }
  }

  public unregister(blur: BlurCustomAttribute): void {
    const blurs = this.blurs;
    const index = blurs.indexOf(blur);
    if (index > -1) {
      blurs.splice(index, 1);
    }
    if (blurs.length === 0) {
      this.removeListeners();
    }
  }

  private addListeners(): void {
    const me = this;
    const dom = me.dom;
    const doc = dom.document;
    const win = dom.window;
    const handler = me.handler;
    const fn = addListener;
    if (win.navigator.pointerEnabled) {
      fn(doc, 'pointerdown', handler, defaultCaptureEventInit);
    } else {
      fn(doc, 'touchstart', handler, defaultCaptureEventInit);
      fn(doc, 'mousedown', handler, defaultCaptureEventInit);
    }
    fn(doc, 'wheel', handler, defaultBubbleEventInit);
    fn(doc, 'focus', handler, defaultCaptureEventInit);
    fn(win, 'blur', handler, defaultBubbleEventInit);
  }

  private removeListeners(): void {
    const me = this;
    const dom = me.dom;
    const doc = dom.document;
    const win = dom.window;
    const handler = me.handler;
    const fn = removeListener;
    if (win.navigator.pointerEnabled) {
      fn(doc, 'pointerdown', handler, defaultCaptureEventInit);
    } else {
      fn(doc, 'touchstart', handler, defaultCaptureEventInit);
      fn(doc, 'mousedown', handler, defaultCaptureEventInit);
    }
    fn(doc, 'wheel', handler, defaultBubbleEventInit);
    fn(doc, 'focus', handler, defaultCaptureEventInit);
    // there is situation where defaultView of document is null???
    if (win !== null) {
      fn(win, 'blur', handler, defaultBubbleEventInit);
    }
  }
}

export interface HasContains {
  contains(el: Element): boolean;
}

export class BlurCustomAttribute {

  public static register: IRegistry['register'];
  public static bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  public static inject: unknown[] = [INode, IDOM];

  public value: boolean | typeof unset;

  public onBlur: () => void;

  /**
   * Used to determine which elemens this attribute will be linked with
   * Interacting with a linked element will not trigger blur for this attribute
   */
  public linkedWith: string | HasContains | (string | HasContains)[];

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

  /**
   * Manager of this custom attribute to centralize listeners
   * @internal No need to expose BlurManager
   */
  private manager: BlurManager;

  private element: Element;
  private dom: HTMLDOM;

  constructor(element: Element, dom: HTMLDOM) {
    this.element = element;
    this.dom = dom;
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
    this.manager = BlurManager.init(dom);
  }

  public attached(): void {
    this.manager.register(this);
  }

  public detaching(): void {
    this.manager.unregister(this);
  }

  public handleEventTarget(target: EventTarget): void {
    if (this.value === false) {
      return;
    }
    if (target === this.manager.dom.window || !this.contains(target as Element)) {
      this.triggerBlur();
    }
  }

  // tslint:disable-next-line:cognitive-complexity
  public contains(target: Element): boolean {
    if (!this.value) {
      return false;
    }
    let els: ArrayLike<Element>;
    let el: string | Element | { contains(el: Element): boolean };
    let i: number, ii: number;
    let j: number, jj: number;
    let links: string | HasContains | (string | HasContains)[];
    let contextNode: Element | null;

    if (this.element.contains(target)) {
      return true;
    }

    if (!this.linkedWith) {
      return false;
    }

    const doc = this.dom.document;
    const linkedWith = this.linkedWith;
    const linkingContext = this.linkingContext;

    links = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
    contextNode =
      (typeof linkingContext === 'string'
        ? doc.querySelector(linkingContext)
        : linkingContext
      )
      || doc.body;

    ii = links.length;
    for (i = 0; ii > i; ++i) {
      el = links[i];
      // When user specify to link with something by a string, it acts as a CSS selector
      // We need to do some querying stuff to determine if target above is contained.
      if (typeof el === 'string') {
        // Default behavior, search the whole tree, from context that user specified, which default to document body
        // Function `query` used will be similar to `querySelectorAll`, but optimized for performant
        if (this.searchSubTree) {
          els = contextNode.querySelectorAll(el);
          jj = els.length;
          for (j = 0; jj > j; ++j) {
            if (els[j].contains(target)) {
              return true;
            }
          }
        } else {
          // default to document body, if user didn't define a linking context, and wanted to ignore subtree.
          // This is specifically performant and useful for dialogs, plugins
          // that usually generate contents to document body
          els = contextNode.children;
          jj = els.length;
          for (j = 0; jj > j; ++j) {
            if (els[j].matches(el)) {
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

CustomAttributeResource.define({ name: 'blur', hasDynamicOptions: true }, BlurCustomAttribute);
BlurCustomAttribute.bindables = ['onBlur', 'linkedWith', 'linkMultiple', 'searchSubTree'].reduce(
  (bindables, prop) => {
    bindables[prop] = { property: prop, attribute: PLATFORM.kebabCase(prop) };
    return bindables;
  },
  // tslint:disable-next-line:no-object-literal-type-assertion
  {
    value: { property: 'value', attribute: 'value', mode: BindingMode.twoWay }
  } as Record<string, IBindableDescription>
);

const createHandler = (
  manager: BlurManager,
  checkTargets: BlurCustomAttribute[]
): EventListenerObject & { [key: string]: (e: Event) => void } => {
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
    handleEventOnBlurs(e);
    checkage &= ~Listeners.pointer;
  };

  const handleTouchStart = (e: TouchEvent): void => {
    if ((checkage & Listeners.touch) > 0) {
      // add mouse flag to checkage only if they are present on usage, and always remove touch flag
      checkage |= (usage & Listeners.mouse) & ~Listeners.touch;
      return;
    }
    handleEventOnBlurs(e);
    checkage &= ~Listeners.touch;
  };

  const handleMousedown = (e: MouseEvent): void => {
    if ((checkage & Listeners.mouse) > 0) {
      checkage &= ~Listeners.mouse;
      return;
    }
    handleEventOnBlurs(e);
    checkage &= ~Listeners.mouse;
  };

  /**
   * Handle globally captured focus event
   */
  const handleFocus = (e: FocusEvent): void => {
    // there are two way a focus gets captured on window
    // when the windows itself got focus
    // and when an element in the document gets focus
    // when the window itself got focus, reacting to it is quite unnecessary
    // as it doesn't really affect element inside the document
    // Do a simple check and bail immediately
    if (e.target === manager.dom.window) {
      checkage = 0;
      return;
    }
    if ((checkage & Listeners.focus) > 0) {
      checkage &= ~Listeners.focus;
      return;
    }
    handleEventOnBlurs(e);
    checkage &= ~Listeners.focus;
  };

  const handleWindowBlur = (): void => {
    checkage = 0;
    for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
      checkTargets[i].triggerBlur();
    }
  };

  const handleMouseWheel = (e: WheelEvent): void => {
    handleEventOnBlurs(e);
  };

  const handleEventOnBlurs = (e: Event): void => {
    const target = e.target;
    for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
      checkTargets[i].handleEventTarget(target);
    }
  };
  return {
    onpointerdown: handlePointerDown,
    ontouchstart: handleTouchStart,
    onmousedown: handleMousedown,
    onfocus: handleFocus,
    onblur: handleWindowBlur,
    onwheel: handleMouseWheel,
    handleEvent(e: Event): void {
      this[`on${e.type}`](e);
    }
  };
};
