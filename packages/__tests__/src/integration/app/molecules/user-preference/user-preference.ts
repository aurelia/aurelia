import { customElement, bindable } from '@aurelia/runtime-html';
import template from './user-preference.html';
import { trace } from '@aurelia/testing';
import { callCollection } from '../../debug.js';

export class TestArray extends Array {
  public indeterminate: string = 'test';
  public constructor(...args: any[]) {
    super(...args);
    Object.setPrototypeOf(this, TestArray.prototype);
  }
}

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - Observers
 *     - `computed-observer`
 *     - `dirty-checker`
 */
@trace(callCollection)
export class User {

  public arr: TestArray;
  public constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
    public role: string,
    public organization: string,
    public city: string,
    public country: string
  ) {
    this.arr = new TestArray();
  }

  public get fullNameStatic(): string {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  // default setting, that is no decorator === `@computed({ static: false })`
  public get fullNameNonStatic(): string {
    if (this.age < 1) {
      return 'infant';
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  public get fullNameWrongStatic(): string {
    if (this.age < 1) {
      return `infant`;
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  public get $role(): string {
    return `${this.role}, ${this.organization}`;
  }
  public set $role(value: string) {
    this.role = value;
  }

  public get $location(): string {
    return `${this.city}, ${this.country}`;
  }
  public set $location(value: string) {
    this.country = value;
  }
}

@customElement({ name: 'user-preference', template })
export class UserPreference {
  @bindable public user: User;
}
