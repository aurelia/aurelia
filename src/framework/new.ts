import { Scope } from './binding/scope';
import { Expression, ILookupFunctions } from './binding/ast';
import { IBinding } from './binding/binding';

export interface AureliaSettings {
  host: HTMLElement,
  root: any
}

export class Aurelia {
  constructor(public settings: AureliaSettings) { 
    this.settings.root.applyTo(this.settings.host);
    this.settings.root.bind();
    this.settings.root.attach();
  }
}

export class InterpolationString implements Expression {
  constructor(private parts: Expression[]) { }

  assign() { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let result = '';
    let parts = this.parts;
    let ii = parts.length;
    for (let i = 0; ii > i; ++i) {
      let partValue = parts[i].evaluate(scope, lookupFunctions);
      if (partValue === null || partValue === undefined) {
        continue;
      }
      result += partValue.toString();
    }
    return result;
  }

  connect(binding: IBinding, scope: Scope) {
    let parts = this.parts;
    let i = parts.length;
    while (i--) {
      parts[i].connect(binding, scope);
    }
  }
}
