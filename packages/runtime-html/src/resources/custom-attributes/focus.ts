import {
  bindable,
  BindingMode,
  customAttribute,
  IController,
  IDOM,
  INode,
  State
} from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
import { addListener, removeListener } from './utils';

/**
 * Focus attribute for element focus binding
 */
@customAttribute('focus')
export class Focus {

  public static readonly inject: unknown = [INode, IDOM];

  @bindable({ mode: BindingMode.twoWay })
  public value: unknown;

  private element: HTMLElement;
  private dom: HTMLDOM;

  /**
   * Indicates whether `apply` should be called when `attached` callback is invoked
   */
  private needsApply: boolean;

  // This is set by the controller after this instance is constructed
  // tslint:disable-next-line: prefer-readonly
  private $controller!: IController;

  constructor(
    element: HTMLElement,
    dom: HTMLDOM
  ) {
    this.element = element;
    this.dom = dom;
    this.needsApply = false;
  }

  public binding(): void {
    this.valueChanged();
  }

  /**
   * Invoked everytime the bound value changes.
   * @param newValue The new value.
   */
  public valueChanged(): void {
    // In theory, we could/should react immediately
    // but focus state of an element cannot be achieved
    // while it's disconnected from the document
    // thus, there neesd to be a check if it's currently connected or not
    // before applying the value to the element
    if (this.$controller.flags & State.isAttached) {
      this.apply();
    }
    // If the element is not currently connect
    // toggle the flag to add pending work for later
    // in attached lifecycle
    // tslint:disable-next-line:one-line
    else {
      this.needsApply = true;
    }
  }

  /**
   * Invoked when the attribute is attached to the DOM.
   */
  public attached(): void {
    if (this.needsApply) {
      this.needsApply = false;
      this.apply();
    }
    // the following block is to help minification
    // as addEventListener method name, together with element property
    // adds quite a bit of munification unfriendly code
    const el = this.element;
    addListener(el, 'focus', this);
    addListener(el, 'blur', this);
  }

  /**
   * Invoked when the attribute is detached from the DOM.
   */
  public detached(): void {
    // the following block is to help minification
    // as addEventListener method name, together with element property
    // adds quite a bit of munification unfriendly code
    const el = this.element;
    removeListener(el, 'focus', this);
    removeListener(el, 'blur', this);
  }

  /**
   * EventTarget interface handler for better memory usage
   */
  public handleEvent(e: FocusEvent): void {
    // there are only two event listened to
    // if the even is focus, it menans the element is focused
    // only need to switch the value to true
    if (e.type === 'focus') {
      this.value = true;
    }
    // else, it's blur event
    // when a blur event happens, there are two situations
    // 1. the element itself lost the focus
    // 2. window lost the focus
    // To handle both (1) and (2), only need to check if
    // current active element is still the same element of this focus custom attribute
    // If it's not, it's a blur event happened on Window because the browser tab lost focus
    // tslint:disable-next-line:one-line
    else if (this.dom.document.activeElement !== this.element) {
      this.value = false;
    }
  }

  /**
   * Focus/blur based on current value
   */
  private apply(): void {
    const el = this.element;
    if (this.value) {
      el.focus();
    } else {
      el.blur();
    }
  }
}
