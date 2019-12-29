import { customElement, valueConverter } from "@aurelia/runtime";

import * as template from './welcome.html';

@customElement({ name: 'welcome', template })
export class Welcome {
  public heading: string = 'Welcome to the Aurelia 2 Navigation App!';
  public firstName: string = 'John';
  public lastName: string = 'Doe';
  private previousValue: string = this.fullName;

  // Getters can't be directly observed, so they must be dirty checked.
  // However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public submit() {
    this.previousValue = this.fullName;
    alert(`Welcome, ${this.fullName}!`);
  }

  public canLeave(): boolean | undefined {
    if (this.fullName !== this.previousValue) {
      return confirm('Are you sure you want to leave?');
    }
  }
}

@valueConverter('upper')
export class UpperValueConverter {
  public toView(value: string): string {
    return value && value.toUpperCase();
  }
}
