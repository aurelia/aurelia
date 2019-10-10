import { computed, customElement, bindable } from '@aurelia/runtime';
import template from './user-preference.html';
import { trace } from '@aurelia/testing';
import { callCollection } from '../../debug';

@customElement({ name: 'user-preference', template })
export class UserPreference {
  @bindable public user: User;
}

@trace(callCollection)
export class User {

  public constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
    public role: string,
    public organization: string,
    public city: string,
    public country: string
  ) { }

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
