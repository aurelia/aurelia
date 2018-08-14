import { inject } from '@aurelia/kernel';
import { BindingContext, IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { IRenderLocation } from '../../dom';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface With extends ICustomAttribute {}
@templateController('with')
@inject(IViewFactory, IRenderLocation)
export class With {
  public value: any = null;

  private $child: IView = null;

  constructor(private factory: IViewFactory, location: IRenderLocation) {
    this.$child = this.factory.create();
    this.$child.$nodes.insertBefore(location);
  }

  public valueChanged(): void {
    if (this.$isBound) {
      this.bindChild();
    }
  }

  public bound(): void {
    this.bindChild();
  }

  public unbound(): void {
    this.$child.$unbind(BindingFlags.none);
  }

  private bindChild(): void {
    this.$child.$bind(
      BindingFlags.none,
      BindingContext.createScopeFromParent(this.$scope, this.value)
    );
  }
}
