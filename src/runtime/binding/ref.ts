import { IExpression } from "./ast";
import { IBinding, IBindingTarget } from "./binding";
import { IContainer } from "../di";
import { IScope } from "./binding-context";

export class Ref implements IBinding {
  private source: IScope;
  private isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: IBindingTarget,
    public container: IContainer) {
  }

  bind(source: IScope) {
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

    this.sourceExpression.assign(this.source, this.target, this.container);
  }

  unbind() {
    if (!this.isBound) {
      return;
    }

    this.isBound = false;

    if (this.sourceExpression.evaluate(this.source, this.container) === this.target) {
      this.sourceExpression.assign(this.source, null, this.container);
    }

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source);
    }

    this.source = null;
  }

  observeProperty(context: any, name: any) { }
}
