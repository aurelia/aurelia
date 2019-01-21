import { IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, bindable, BindingMode, CustomAttributeResource, IAttributeDefinition, ICustomAttribute, ICustomAttributeResource, INode, State } from '@aurelia/runtime';
import { addListener, removeListener } from './utils';

// tslint:disable
// let useTouch = false;
let useMouse = false;
// let usePointer = false;
// let useFocus = false;

export interface BlurConfig {
  touch?: boolean;
  mouse?: boolean;
  pointer?: boolean;
  focus?: boolean;
  windowBlur?: boolean;
}

export interface IBlurCustomAttributeListenable {
  touch(on: boolean): IBlurCustomAttributeListenable;
  mouse(on: boolean): IBlurCustomAttributeListenable;
  pointer(on: boolean): IBlurCustomAttributeListenable;
  focus(on: boolean): IBlurCustomAttributeListenable;
  windowBlur(on: boolean): IBlurCustomAttributeListenable;
  wheel(on: boolean): IBlurCustomAttributeListenable;
}

export class BlurCustomAttribute {

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  public static inject: unknown[] = [INode];

  public static readonly listen: IBlurCustomAttributeListenable = {
    touch(on: boolean): IBlurCustomAttributeListenable {
      const fn = on ? addListener : removeListener;
      fn(document, 'touchstart', handleTouchStart, true);
      return BlurCustomAttribute.listen;
    },
    mouse(on: boolean): IBlurCustomAttributeListenable {
      useMouse = !!on;
      const fn = on ? addListener : removeListener;
      fn(document, 'mousedown', handleMousedown, true);
      return BlurCustomAttribute.listen;
    },
    pointer(on: boolean): IBlurCustomAttributeListenable {
      const fn = on ? addListener : removeListener;
      fn(document, 'pointerdown', handlePointerDown, true);
      return BlurCustomAttribute.listen;
    },
    focus(on: boolean): IBlurCustomAttributeListenable {
      const fn = on ? addListener : removeListener;
      fn(window, 'focus', handleWindowFocus, true);
      return BlurCustomAttribute.listen;
    },
    windowBlur(on: boolean): IBlurCustomAttributeListenable {
      const fn = on ? addListener : removeListener;
      fn(window, 'blur', handleWindowBlur, false);
      return BlurCustomAttribute.listen;
    },
    wheel(on: boolean): IBlurCustomAttributeListenable {
      const fn = on ? addListener : removeListener;
      fn(window, 'wheel', handleMouseWheel, false);
      return BlurCustomAttribute.listen;
    }
  }

  public static use(cfg: BlurConfig): void {
    for (const prop in cfg) {
      if (prop in this.listen) {
        (this.listen)[prop]((cfg)[prop]);
      }
    }
  }

  public value: boolean;

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
    this.linkedMultiple = true;
    this.searchSubTree = true;
    this.linkingContext = null;
  }

  public attached() {
    checkTargets.push(this);
  }

  public detached() {
    unregister(this);
  }

  public contains(target: Element): boolean {
    if (!this.value) {
      return false;
    }
    let els;
    let el;
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

    const { linkedWith, linkingContext } = this;

    links = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
    contextNode = (typeof linkingContext === 'string' ? document.querySelector(linkingContext) : linkingContext) || document.body;
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

CustomAttributeResource.define('blur', BlurCustomAttribute);
bindable({ mode: BindingMode.twoWay })(BlurCustomAttribute, 'value');
['onBlur', 'linkedWith', 'linkMultiple', 'searchSubTree'].forEach(prop => bindable(prop)(BlurCustomAttribute));

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

let checkTargets: BlurCustomAttribute[] = [];
function unregister(attr: BlurCustomAttribute) {
  let idx = checkTargets.indexOf(attr);
  if (idx !== -1) {
    checkTargets.splice(idx, 1);
  }
}

let alreadyChecked = false;
let cleanCheckTimeout: any = 0;
function revertAlreadyChecked() {
  alreadyChecked = false;
  cleanCheckTimeout = 0;
}

function handlePointerDown(e: PointerEvent) {
  let target = getTargetFromEvent(e);
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    let attr = checkTargets[i];
    if (window === target || !attr.contains(target as Element)) {
      attr.triggerBlur();
    }
  }
  alreadyChecked = true;
  cleanCheckTimeout = setTimeout(revertAlreadyChecked, 50);
}

function handleTouchStart(e: TouchEvent) {
  if (alreadyChecked) {
    if (!useMouse) { // If user listen to mouse even, dont revert, let mousedownHandler do the job
      clearTimeout(cleanCheckTimeout);
      revertAlreadyChecked();
    }
    return;
  }
  let target = getTargetFromEvent(e);
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    let attr = checkTargets[i];
    if (target === window || !attr.contains(target as Element)) {
      attr.triggerBlur();
    }
  }
  alreadyChecked = true;
  cleanCheckTimeout = setTimeout(revertAlreadyChecked, 50);
}

function handleMousedown(e: MouseEvent) {
  if (alreadyChecked) {
    clearTimeout(cleanCheckTimeout);
    revertAlreadyChecked();
    return;
  }
  let target = getTargetFromEvent(e);
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    let attr = checkTargets[i];
    if (window === target || !attr.contains(target as Element)) {
      attr.triggerBlur();
    }
  }
  alreadyChecked = true;
  cleanCheckTimeout = setTimeout(revertAlreadyChecked, 50);
}

function handleWindowFocus(e: FocusEvent) {
  if (alreadyChecked) {
    clearTimeout(cleanCheckTimeout);
    revertAlreadyChecked();
    return;
  }
  let target = getTargetFromEvent(e);
  let shouldBlur = target === window;
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    let attr = checkTargets[i];
    if (shouldBlur || !attr.contains(target as Element)) {
      attr.triggerBlur();
    }
  }
}

function handleWindowBlur() {
  for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
    checkTargets[i].triggerBlur();
  }
}

function handleMouseWheel(e: WheelEvent): void {
  let target = getTargetFromEvent(e);
  let shouldBlur = target === window;
  
  for (let i = 0, ii = checkTargets.length; ii > i; ++i) {
    let attr = checkTargets[i];
    if (shouldBlur || !attr.contains(target as Element)) {
      attr.triggerBlur();
    }
  }
}

function getTargetFromEvent(e: Event): EventTarget {
  return e.target;
}
