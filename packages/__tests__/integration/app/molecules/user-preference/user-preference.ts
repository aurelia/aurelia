/* eslint-disable jsdoc/check-indentation */
import { computed, customElement, bindable } from '@aurelia/runtime';
import template from './user-preference.html';
import { trace } from '@aurelia/testing';
import { callCollection } from '../../debug';

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

  @computed({ static: true })
  public get fullNameStatic() {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  // default setting, that is no decorator === `@computed({ static: false })`
  public get fullNameNonStatic() {
    if (this.age < 1) {
      return 'infant';
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  @computed({ static: true })
  public get fullNameWrongStatic() {
    if (this.age < 1) {
      return `infant`;
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  public get roleNonVolatile() {
    return `${this.role}, ${this.organization}`;
  }
  public set roleNonVolatile(value: string) {
    this.role = value;
  }

  @computed({ volatile: true })
  public get locationVolatile() {
    return `${this.city}, ${this.country}`;
  }
  public set locationVolatile(value: string) {
    this.country = value;
  }
}

@customElement({ name: 'user-preference', template })
export class UserPreference {
  @bindable public user: User;
}
