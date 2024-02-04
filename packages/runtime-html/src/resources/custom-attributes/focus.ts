import { twoWay } from '../../binding/interfaces-bindings';
import { INode } from '../../dom';
import { IPlatform } from '../../platform';
import { customAttribute } from '../custom-attribute';
import { bindable } from '../../bindable';
import type { ICustomAttributeController, ICustomAttributeViewModel } from '../../templating/controller';
import { resolve } from '@aurelia/kernel';

/**
 * Focus attribute for element focus binding
 */
export class Focus implements ICustomAttributeViewModel {
  public readonly $controller!: ICustomAttributeController<this>;

  @bindable({ mode: twoWay })
  public value: unknown;

  /**
   * Indicates whether `apply` should be called when `attached` callback is invoked
   *
   * @internal
   */
  private _needsApply: boolean = false;

  /** @internal */
  private readonly _element = resolve(INode) as INode<HTMLElement>;

  /** @internal */
  private readonly _platform = resolve(IPlatform);

  public binding(): void {
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
      this._apply();
    } else {
      // If the element is not currently connect
      // toggle the flag to add pending work for later
      // in attached lifecycle
      this._needsApply = true;
    }
  }

  /**
   * Invoked when the attribute is attached to the DOM.
   */
  public attached(): void {
    if (this._needsApply) {
      this._needsApply = false;
      this._apply();
    }
    this._element.addEventListener('focus', this);
    this._element.addEventListener('blur', this);
  }

  /**
   * Invoked when the attribute is afterDetachChildren from the DOM.
   */
  public detaching(): void {
    const el = this._element;
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
    } else if (!this._isElFocused) {
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
   *
   * @internal
   */
  private _apply(): void {
    const el = this._element;
    const isFocused = this._isElFocused;
    const shouldFocus = this.value;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (shouldFocus && !isFocused) {
      el.focus();
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    } else if (!shouldFocus && isFocused) {
      el.blur();
    }
  }

  /** @internal */
  private get _isElFocused(): boolean {
    return this._element === this._platform.document.activeElement;
  }
}

customAttribute('focus')(Focus);
