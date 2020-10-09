import {
  bindable,
  BindingMode,
  customAttribute,
  IDOM,
  INode,
  ICustomAttributeController,
  ICustomAttributeViewModel
} from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';

/**
 * Focus attribute for element focus binding
 */
@customAttribute('focus')
export class Focus implements ICustomAttributeViewModel<HTMLElement> {

  public readonly $controller!: ICustomAttributeController<HTMLElement, this>;

  @bindable({ mode: BindingMode.twoWay })
  public value: unknown;

  /**
   * Indicates whether `apply` should be called when `afterAttachChildren` callback is invoked
   */
  private needsApply: boolean = false;

  private readonly element: HTMLElement;

  public constructor(@INode element: INode, @IDOM private readonly dom: HTMLDOM) {
    this.element = element as HTMLElement;
  }

  public beforeBind(): void {
    this.valueChanged();
  }

  /**
   * Invoked everytime the bound value changes.
   *
   * @param newValue - The new value.
   */
  public valueChanged(): void {
    // In theory, we could/should react immediately
    // but focus state of an element cannot be achieved
    // while it's disconnected from the document
    // thus, there neesd to be a check if it's currently connected or not
    // before applying the value to the element
    if (this.$controller.isActive) {
      this.apply();
    } else {
      // If the element is not currently connect
      // toggle the flag to add pending work for later
      // in afterAttachChildren lifecycle
      this.needsApply = true;
    }
  }

  /**
   * Invoked when the attribute is afterAttachChildren to the DOM.
   */
  public afterAttachChildren(): void {
    if (this.needsApply) {
      this.needsApply = false;
      this.apply();
    }
    const el = this.element;
    el.addEventListener('focus', this);
    el.addEventListener('blur', this);
  }

  /**
   * Invoked when the attribute is afterDetachChildren from the DOM.
   */
  public afterDetachChildren(): void {
    const el = this.element;
    el.removeEventListener('focus', this);
    el.removeEventListener('blur', this);
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
    } else if (this.dom.document.activeElement !== this.element) {
      // else, it's blur event
      // when a blur event happens, there are two situations
      // 1. the element itself lost the focus
      // 2. window lost the focus
      // To handle both (1) and (2), only need to check if
      // current active element is still the same element of this focus custom attribute
      // If it's not, it's a blur event happened on Window because the browser tab lost focus
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
