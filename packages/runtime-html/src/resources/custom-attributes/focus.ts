import { IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, bindable, BindingMode, CustomAttributeResource, IAttributeDefinition, ICustomAttribute, ICustomAttributeResource, INode, State } from '@aurelia/runtime';
import { addListener, removeListener } from './utils';

export interface FocusCustomAttribute extends ICustomAttribute {}
export class FocusCustomAttribute implements FocusCustomAttribute  {

  // tslint:disable-next-line:ban-types
  public static readonly inject: ReadonlyArray<Function> = [INode];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'] = {
    value: { property: 'value', attribute: 'value', mode: BindingMode.twoWay }
  };
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  public value: unknown;

  private element: HTMLElement;

  /**
   * Indicates whether `apply` should be called when `attached` callback is invoked
   */
  private needsApply: boolean;

  constructor(
    element: HTMLElement,
  ) {
    this.element = element;
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
    // In theory, we can react immediately
    // but focus state of an element cannot be achieved
    // while it's disconnected from the document
    // thus, there neesd to be a check if it's currently connected or not
    // before applying the value to the element
    if (this.$state & State.isAttached) {
      this.apply();
    }
    // If the element is not currently connect
    // toggle the flag to add pending work for later
    // in attached lifecycle
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
    else if (document.activeElement !== this.element) {
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

CustomAttributeResource.define({ name: 'focus' }, FocusCustomAttribute);
