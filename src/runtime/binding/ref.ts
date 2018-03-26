import { IExpression, ILookupFunctions } from "./ast";
import { IBinding, IBindingTarget } from "./binding";
import { Scope } from './binding-interfaces'

export class Ref implements IBinding {
  private source: Scope;
  private isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: IBindingTarget,
    public lookupFunctions: ILookupFunctions) {
  }

  bind(source: Scope) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source);
    }

    this.sourceExpression.assign(this.source, this.target, this.lookupFunctions);
  }

  unbind() {
    if (!this.isBound) {
      return;
    }

    this.isBound = false;

    if (this.sourceExpression.evaluate(this.source, this.lookupFunctions) === this.target) {
      this.sourceExpression.assign(this.source, null, this.lookupFunctions);
    }

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source);
    }

    this.source = null;
  }

  observeProperty(context: any, name: any) { }
}
