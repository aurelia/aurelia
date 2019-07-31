import { IServiceLocator } from '@aurelia/kernel';
import { connectable, IObserverLocator, IPartialConnectableBinding, IScope, IsExpression, LifecycleFlags, State } from '@aurelia/runtime';
import i18next from 'i18next';
import { I18N, I18nService } from '../i18n';

@connectable()
export class TranslationBinding implements IPartialConnectableBinding {
  public id!: number;
  public $state: State;
  public expr?: string | IsExpression;
  public parametersExpr?: IsExpression;
  private readonly i18n: I18nService;

  constructor(
    public readonly target: HTMLElement,
    private readonly instruction: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
  ) {
    this.$state = State.none;
    this.i18n = this.locator.get(I18N);
  }
  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void {
    if (!this.expr) { throw new Error('key expression is missing'); }
    // TODO if it is a interpolation expression then observe for changes too
    const keyExpr = typeof this.expr === 'string' ? this.expr : this.expr.evaluate(flags, scope, this.locator, part) as string;
    const paramExpr = this.parametersExpr ? this.parametersExpr.evaluate(flags, scope, this.locator, part) : undefined;

    // if (this.parametersExpr) {
    //   console.log(`t-params ${this.parametersExpr} evaluated to ${JSON.stringify(paramExpr, undefined, 2)}`);
    // }

    const results = this.i18n.evaluate(keyExpr, paramExpr as i18next.TOptions<object>);
    // console.log(`${keyExpr} is evaluated to ${JSON.stringify(results, undefined, 2)}`);

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
