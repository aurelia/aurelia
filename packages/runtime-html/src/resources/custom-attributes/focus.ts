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
    if (this.$state & State.isAttached) {
      this.apply();
    } else {
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
    const el = this.element;
    addListener(el, 'focus', this);
    addListener(el, 'blur', this);
  }

  /**
   * Invoked when the attribute is detached from the DOM.
   */
  public detached(): void {
    const el = this.element;
    removeListener(el, 'focus', this);
    removeListener(el, 'blur', this);
  }

  /**
   * EventTarget interface handler for better memory usage
   */
  public handleEvent(e: FocusEvent): void {
    if (e.type === 'focus') {
      this.value = true;
    } else if (document.activeElement !== this.element) {
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
