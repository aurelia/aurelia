import { IServiceLocator } from '@aurelia/kernel';
import { AccessMemberExpression, connectable, IObserverLocator, IPartialConnectableBinding, IScope, LifecycleFlags, PrimitiveLiteralExpression, State, IsExpression } from '@aurelia/runtime';
import { I18N, I18nService } from "../i18n";

@connectable()
export class TranslationBinding implements IPartialConnectableBinding {
  public id!: number;
  public $state: State;
  private readonly i18n: I18nService;

  constructor(
    private readonly expr: string | IsExpression,
    private readonly target: HTMLElement,
    private readonly instruction: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
  ) {
    this.$state = State.none;
    this.i18n = this.locator.get(I18N);
  }
  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void {
    // TODO if it is a interpolation expression then observe for changes too
    const keyExpr = typeof this.expr === 'string' ? this.expr : this.expr.evaluate(flags, scope, this.locator, part) as string;

    const results = this.i18n.evaluate(keyExpr);
    for (const item of results) {
      const value = item.value;
      let attributes = item.attributes;
      if (attributes.length === 0) {
        attributes = this.target.tagName === 'IMG' ? ['src'] : ['textContent'];
      }
      for (const attr of attributes) {
        const observer = this.observerLocator.getAccessor(LifecycleFlags.none, this.target, attr);
        observer.setValue(value, flags);
      }
    }
  }
  public $unbind(flags: LifecycleFlags): void { }
  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void { }
}
