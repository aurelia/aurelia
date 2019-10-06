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
  ) { }

  public get fullNameDefault() {
    this.log('default');
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  @computed({ static: true })
  public get fullNameStatic() {
    this.log('static');
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  @computed({ volatile: true })
  public get fullNameVolatile() {
    this.log('volatile');
    if (this.age < 1) {
      return `infant`;
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  // @computed({ static: true })
  public get fullNameWrongStatic() {
    this.log('wrongStatic');
    if (this.age < 1) {
      return `infant`;
    }
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }

  private log(name: 'default' | 'static' | 'volatile' | 'wrongStatic') {
    this.changes.add(name);
  }
  private getFullName() {
    return `${this.firstName}${this.lastName ? ` ${this.lastName}` : ''}`;
  }
}
