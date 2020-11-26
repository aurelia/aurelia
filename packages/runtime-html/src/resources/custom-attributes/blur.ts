import { emptyArray } from '@aurelia/kernel';
import { INode, NodeType } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { customAttribute } from '../custom-attribute.js';
import { bindable } from '../../bindable.js';
import type { ICustomAttributeController, ICustomAttributeViewModel } from '../../templating/controller.js';

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
  private readonly blurs: Blur[] = [];
  private readonly handler: EventListenerObject;

  private constructor(
    public readonly platform: IPlatform,
  ) {
    blurDocMap.set(platform.document, this);
    this.handler = createHandler(this, this.blurs);
  }

  public static createFor(platform: IPlatform): BlurManager {
    return blurDocMap.get(platform.document) || new BlurManager(platform);
  }

  public register(blur: Blur): void {
    const blurs = this.blurs;
    if (!blurs.includes(blur) && blurs.push(blur) === 1) {
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
    const p = this.platform;
    const doc = p.document;
    const win = p.window;
    const handler = this.handler;
    if (win.navigator.pointerEnabled) {
      doc.addEventListener('pointerdown', handler, defaultCaptureEventInit);
    }
    doc.addEventListener('touchstart', handler, defaultCaptureEventInit);
    doc.addEventListener('mousedown', handler, defaultCaptureEventInit);
    doc.addEventListener('focus', handler, defaultCaptureEventInit);
    win.addEventListener('blur', handler, defaultBubbleEventInit);
  }

  private removeListeners(): void {
    const p = this.platform;
    const doc = p.document;
    const win = p.window;
    const handler = this.handler;
    if (win.navigator.pointerEnabled) {
      doc.removeEventListener('pointerdown', handler, defaultCaptureEventInit);
    }
    doc.removeEventListener('touchstart', handler, defaultCaptureEventInit);
    doc.removeEventListener('mousedown', handler, defaultCaptureEventInit);
    doc.removeEventListener('focus', handler, defaultCaptureEventInit);
    win.removeEventListener('blur', handler, defaultBubbleEventInit);
  }
}

export interface HasContains {
  contains(el: Element): boolean;
}

@customAttribute('blur')
export class Blur implements ICustomAttributeViewModel {

  public readonly $controller!: ICustomAttributeController<this>;

  @bindable()
  public value: boolean | typeof unset;

  @bindable()
  public onBlur!: () => void;

  /**
   * Used to determine which elements this attribute will be linked with
   * Interacting with a linked element will not trigger blur for this attribute
   */
  @bindable()
  public linkedWith!: string | HasContains | (string | HasContains)[];

  /**
   * Only used when `linkedWith` is a string and searchSubTree is `true`.
   * Used to determine whether to use querySelector / querySelectorAll to find all interactable elements without triggering blur.
   */
  @bindable()
  public linkedMultiple: boolean;

  /**
   * Only used when linkedWith is a string, or an array containing some strings
   * During query for finding element to link with:
   * - `true`: search all descendants
   * - `false`: search immediate children using for loop
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
   *
   * @internal No need to expose BlurManager
   */
  private readonly manager: BlurManager;

  public constructor(
    @INode private readonly element: INode<HTMLElement>,
    @IPlatform private readonly p: IPlatform,
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
    this.manager = BlurManager.createFor(p);
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
    const p = this.p;
    if (target === p.window || target === p.document || !this.contains(target as Element)) {
      this.triggerBlur();
    }
  }

  public contains(target: Element): boolean {
    if (!this.value) {
      return false;
    }
    let els: ArrayLike<Element>;
    let i: number;
    let j: number, jj: number;
    let link: string | HasContains;

    const element = this.element;
    if (containsElementOrShadowRoot(element, target)) {
      return true;
    }

    if (!this.linkedWith) {
      return false;
    }

    const doc = this.p.document;
    const linkedWith = this.linkedWith;
    const linkingContext = this.linkingContext;
    const searchSubTree = this.searchSubTree;
    const linkedMultiple = this.linkedMultiple;

    const links: string | HasContains | (string | HasContains)[] = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
    const contextNode: Element | null =
      (typeof linkingContext === 'string'
        ? doc.querySelector(linkingContext)
        : linkingContext
      )
      || doc.body;

    const ii: number = links.length;
    for (i = 0; ii > i; ++i) {
      link = links[i];
      // When user specify to link with something by a string, it acts as a CSS selector
      // We need to do some querying stuff to determine if target above is contained.
      if (typeof link === 'string') {
        // Default behavior, search the whole tree, from context that user specified, which default to document body
        if (searchSubTree) {
          // todo: are there too many knobs?? Consider remove "linkedMultiple"??
          if (!linkedMultiple) {
            const el = contextNode.querySelector(link);
            els = el !== null ? [el] : emptyArray;
          } else {
            els = contextNode.querySelectorAll(link);
          }
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
            if (els[j].matches(link)) {
              return true;
            }
          }
        }
      } else {
        // When user passed in something that is not a string,
        // simply check if has method `contains` (allow duck typing)
        // and call it against target.
        // This enables flexible usages
        if (link && link.contains(target)) {
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

const containsElementOrShadowRoot = (container: HTMLElement, target: Node): boolean => {
  if (container.contains(target)) {
    return true;
  }
  let parentNode: Node | null = null;
  while (target != null) {

    if (target === container) {
      return true;
    }

    parentNode = target.parentNode;

    if (parentNode === null && target.nodeType === NodeType.DocumentFragment) {
      target = (target as ShadowRoot).host;
      continue;
    }
    target = parentNode as Node;
  }
  return false;
};

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
  const revertCheckage = () => {
    hasChecked = false;
  };
  const markChecked = () => {
    hasChecked = true;
    manager.platform.domWriteQueue.queueTask(revertCheckage, { preempt: true });
  };

  const handleMousedown = (e: MouseEvent): void => {
    if (!hasChecked) {
      handleEvent(e);
      markChecked();
    }
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
  const handleFocus = (e: FocusEvent): void => {
    if (hasChecked) {
      return;
    }
    // there are two way a focus gets captured on window
    // when the windows itself got focus
    // and when an element in the document gets focus
    // when the window itself got focus, reacting to it is quite unnecessary
    // as it doesn't really affect element inside the document
    // Do a simple check and bail immediately
    const isWindow = e.target === manager.platform.window;
    if (isWindow) {
      for (let i = 0, ii = checkTargets.length; ii > i; ++i) {
        checkTargets[i].triggerBlur();
      }
    } else {
      handleEvent(e);
    }
    markChecked();
  };

  const handleWindowBlur = (): void => {
    hasChecked = false;
    for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
      checkTargets[i].triggerBlur();
    }
  };

  const handleEvent = (e: Event): void => {
    const target = e.composed ? e.composedPath()[0] : e.target;
    if (target === null) {
      return;
    }
    for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
      checkTargets[i].handleEventTarget(target);
    }
  };

  return {
    onpointerdown: handleMousedown as EventHandler,
    ontouchstart: handleMousedown  as EventHandler,
    onmousedown: handleMousedown as EventHandler,
    onfocus: handleFocus as EventHandler,
    onblur: handleWindowBlur as EventHandler,
    handleEvent(e: Event): void {
      this[`on${e.type}`](e);
    }
  };
};
