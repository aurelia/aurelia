import { computed, customElement, bindable } from '@aurelia/runtime';
import template from './user-preference.html';

@customElement({ name: 'user-preference', template })
export class UserPreference {
  @bindable public user: User;
}

export class User {

  public changes = new Set<string>();
  constructor(
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
    this.log('static');
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  // default setting that is no decorator === `@computed({ static: false })`
  public get fullNameNonStatic() {
    this.log('nonStatic');
    if (this.age < 1) {
      return 'infant';
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  @computed({ static: true })
  public get fullNameWrongStatic() {
    this.log('wrongStatic');
    if (this.age < 1) {
      return `infant`;
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  public get roleNonVolatile() {
    this.log('nonVolatile');
    return `${this.role}, ${this.organization}`;
  }
  public set roleNonVolatile(value: string) {
    this.role = value;
  }


  @computed({ volatile: true })
  public get locationVolatile() {
    this.log('volatile');
    return `${this.city}, ${this.country}`;
  }
  public set locationVolatile(value: string) {
    this.country = value;
  }

  private log(name: 'default' | 'static' | 'nonStatic' | 'wrongStatic' | 'nonVolatile' | 'volatile') {
    this.changes.add(name);
  }
  private getFullName() {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }
}
