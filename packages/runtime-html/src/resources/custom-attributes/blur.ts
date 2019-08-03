import {
  bindable,
  customAttribute,
  IDOM,
  INode
} from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';

function addListener(el: EventTarget, evt: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
  el.addEventListener(evt, handler, options);
}

function removeListener(el: EventTarget, evt: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
  el.removeEventListener(evt, handler, options);
}

const enum Listeners {
  touch = 1,
  mouse = 2,
  pointer = 4,
  blur = 8,
  focus = 16,
  wheel = 32,
  all = 63
}

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

  private blurs: Blur[];
  private handler: EventListenerObject;

  private constructor(
    public readonly dom: HTMLDOM
  ) {
    blurDocMap.set(dom.document, this);
    this.dom = dom;
    this.blurs = [];
    this.handler = createHandler(this, this.blurs);
  }

  public static createFor(dom: HTMLDOM): BlurManager {
    return blurDocMap.get(dom.document) || new BlurManager(dom);
  }

  public register(blur: Blur): void {
    const blurs = this.blurs;
    if (blurs.indexOf(blur) === -1 && blurs.push(blur) === 1) {
      this.addListeners();
    }
  }

  public unregister(blur: Blur): void {
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
    }
    fn(doc, 'touchstart', handler, defaultCaptureEventInit);
    fn(doc, 'mousedown', handler, defaultCaptureEventInit);
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
    }
    fn(doc, 'touchstart', handler, defaultCaptureEventInit);
    fn(doc, 'mousedown', handler, defaultCaptureEventInit);
    fn(doc, 'wheel', handler, defaultBubbleEventInit);
    fn(doc, 'focus', handler, defaultCaptureEventInit);
    fn(win, 'blur', handler, defaultBubbleEventInit);
  }
}

export interface HasContains {
  contains(el: Element): boolean;
}

@customAttribute({
  name: 'blur',
  hasDynamicOptions: true
})
export class Blur {

  @bindable()
  public value: boolean | typeof unset;

  @bindable()
  public onBlur!: () => void;

  /**
   * Used to determine which elemens this attribute will be linked with
   * Interacting with a linked element will not trigger blur for this attribute
   */
  @bindable()
  public linkedWith!: string | HasContains | (string | HasContains)[];

  /**
   * Only used when linkedWith is a string.
   * Used to determine whether to use querySelector / querySelectorAll to find all interactable elements without triggering blur
   * Performace wise Consider using this only when necessary
   */
  @bindable()
  public linkedMultiple: boolean;

  /**
   * Only used when linkedWith is a string, or an array containing some strings
   * During query for finding element to link with:
   * - true: search all children, using `querySelectorAll`
   * - false: search immediate children using for loop
   */
  @bindable()
  public searchSubTree: boolean;

  /**
   * Only used when linkedWith is a string. or an array containing a string
   * Determine from which node/ nodes, search for elements
   */
  @bindable()
  public linkingContext: string | Element | null;

  /**
   * Manager of this custom attribute to centralize listeners
   * @internal No need to expose BlurManager
   */
  private manager: BlurManager;

  constructor(
    @INode private readonly element: Element,
    @IDOM private readonly dom: HTMLDOM
  ) {
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
    this.manager = BlurManager.createFor(dom);
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
    const dom = this.dom;
    if (target === dom.window || target === dom.document || !this.contains(target as Element)) {
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

type EventHandler = (e: Event) => void;

const createHandler = (
  manager: BlurManager,
  checkTargets: Blur[]
): EventListenerObject & Record<string, EventHandler> => {
  // *******************************
  // EVENTS ORDER
  // -----------------------------
  // pointerdown
  // touchstart
  // pointerup
  // touchend
  // mousedown
  // --------------
  // BLUR
  // FOCUS
  // --------------
  // mouseup
  // click
  //
  // ******************************
  //
  // There are cases focus happens without mouse interaction (keyboard)
  // So it needs to capture both mouse / focus movement
  //
  // ******************************

  let hasChecked: boolean = false;

  const win = manager.dom.window;
  const rAF = win.requestAnimationFrame;
  const cancelRAF = win.cancelAnimationFrame;
  let rAFId: number;
  const revertCheckage = () => {
    hasChecked = false;
  };
  const cancelQueueRevertCheckage = () => {
    cancelRAF(rAFId);
  };
  const queueRevertCheckage = () => {
    rAFId = rAF(revertCheckage);
  };

  // method name are prefixed by a number to signal its order in event series
  const _1__handlePointerDown = (e: PointerEvent): void => {
    handleEvent(e);
    hasChecked = true;
    queueRevertCheckage();
  };

  const _2__handleTouchStart = (e: TouchEvent): void => {
    if (hasChecked) {
      cancelQueueRevertCheckage();
      queueRevertCheckage();
      return;
    }
    handleEvent(e);
    hasChecked = true;
    // still queue revert change in case touch event is synthetic
    // but blur effect is still desired in such scenario
    queueRevertCheckage();
  };

  const _3__handleMousedown = (e: MouseEvent): void => {
    if (hasChecked) {
      cancelQueueRevertCheckage();
      queueRevertCheckage();
      return;
    }
    handleEvent(e);
    hasChecked = true;
    // still queue revert change in case mouse event is synthetic
    // but blur effect is still desired in such scenario
    queueRevertCheckage();
  };

  /**
   * Handle globally captured focus event
   * This can happen via a few way:
   * User clicks on a focusable element
   * User uses keyboard to navigate to a focusable element
   * User goes back to the window from another browser tab
   * User clicks on a non-focusable element
   * User clicks on the window, outside of the document
   */
  const _4__handleFocus = (e: FocusEvent): void => {
    if (hasChecked) {
      cancelQueueRevertCheckage();
      queueRevertCheckage();
      return;
    }
    // there are two way a focus gets captured on window
    // when the windows itself got focus
    // and when an element in the document gets focus
    // when the window itself got focus, reacting to it is quite unnecessary
    // as it doesn't really affect element inside the document
    // Do a simple check and bail immediately
    const isWindow = e.target === win;
    if (isWindow) {
      for (let i = 0, ii = checkTargets.length; ii > i; ++i) {
        checkTargets[i].triggerBlur();
      }
    } else {
      handleEvent(e);
    }
    hasChecked = true;
    queueRevertCheckage();
  };

  const handleWindowBlur = (): void => {
    hasChecked = false;
    for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
      checkTargets[i].triggerBlur();
    }
  };

  const handleMouseWheel = (e: WheelEvent): void => {
    handleEvent(e);
  };

  const handleEvent = (e: Event): void => {
    const target = e.target;
    if (target === null) {
      return;
    }
    for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
      checkTargets[i].handleEventTarget(target);
    }
  };

  return {
    onpointerdown: _1__handlePointerDown as EventHandler,
    ontouchstart: _2__handleTouchStart  as EventHandler,
    onmousedown: _3__handleMousedown as EventHandler,
    onfocus: _4__handleFocus as EventHandler,
    onblur: handleWindowBlur as EventHandler,
    onwheel: handleMouseWheel as EventHandler,
    handleEvent(e: Event): void {
      this[`on${e.type}`](e);
    }
  };
};
