import { INode } from '../../dom.node';
import { IPlatform } from '../../platform';
import { attrTypeName, type CustomAttributeStaticAuDefinition } from '../custom-attribute';

import type { ICustomAttributeViewModel } from '../../templating/controller';
import { IInstruction, HydrateAttributeInstruction } from '@aurelia/template-compiler';
import { resolve } from '@aurelia/kernel';
import { queueTask } from '@aurelia/runtime';

export class Show implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'show',
    bindables: ['value'],
    aliases: ['hide']
  };

  public value: unknown;

  private readonly el = resolve(INode) as INode<HTMLElement>;
  private readonly p = resolve(IPlatform);

  /** @internal */ private _isActive: boolean = false;
  /** @internal */ private _isQueued: boolean = false;

  /** @internal */ private _isToggled: boolean;
  /** @internal */ private readonly _base: boolean;

  public constructor() {
    const instr = resolve(IInstruction) as HydrateAttributeInstruction;
    // if this is declared as a 'hide' attribute, then this.base will be false, inverting everything.
    this._isToggled = this._base = instr.alias !== 'hide';
  }

  public binding(): void {
    this._isActive = true;
    this.update();
  }

  public detaching() {
    this._isActive = false;
    this._isQueued = false;
  }

  public valueChanged(): void {
    if (this._isActive && !this._isQueued) {
      this._isQueued = true;
      queueTask(this.update);
    }
  }

  private $val: string = '';
  private $prio: string = '';
  private readonly update = (): void => {
    this._isQueued = false;

    // Only compare at the synchronous moment when we're about to update, because the value might have changed since the update was queued.
    if (Boolean(this.value) !== this._isToggled) {
      if (this._isToggled === this._base) {
        this._isToggled = !this._base;
        // Note: in v1 we used the 'au-hide' class, but in v2 it's so trivial to conditionally apply classes (e.g. 'hide.class="someCondition"'),
        // that it's probably better to avoid the CSS inject infra involvement and keep this CA as simple as possible.
        // Instead, just store and restore the property values (with each mutation, to account for in-between updates), to cover the common cases, until there is convincing feedback to do otherwise.
        this.$val = this.el.style.getPropertyValue('display');
        this.$prio = this.el.style.getPropertyPriority('display');
        this.el.style.setProperty('display', 'none', 'important');
      } else {
        this._isToggled = this._base;
        this.el.style.setProperty('display', this.$val, this.$prio);
        // If the style attribute is now empty, remove it.
        if (this.el.getAttribute('style') === '') {
          this.el.removeAttribute('style');
        }
      }
    }
  };
}
