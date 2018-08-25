import { inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding';
import { INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean;

  private elseBehavior: Else;
  private $child: IView;
  private ifView: IView;
  private elseView: IView;
  private encapsulationSource: INode;

  constructor(private factory: IViewFactory, private location: IRenderLocation) {}

  public bound(): void {
    this.update(this.value, BindingFlags.fromBind);
  }

  public attaching(encapsulationSource: INode): void {
    this.encapsulationSource = encapsulationSource;
  }

  public unbound(): void {
    if (this.$child) {
      this.$child.$unbind(BindingFlags.fromUnbind);
      this.$child = null;
    }
  }

  public valueChanged(newValue: any): void {
    this.update(newValue, BindingFlags.fromBindableHandler);
  }

  public link(elseBehavior: Else): void {
    if (this.elseBehavior !== elseBehavior) {
      this.elseBehavior = elseBehavior;
      elseBehavior.link(this);
    }
  }

  private update(renderTrueBranch: boolean, flags: BindingFlags): void {
    if (renderTrueBranch) {
      if (this.$child) {
        if (this.$child === this.ifView) {
          return;
        }

        this.removeChild(flags);
      }

      this.$child = this.ifView || (this.ifView = this.factory.create());
      this.addChild(flags);
    } else if (this.elseBehavior) {
      if (this.$child) {
        if (this.$child === this.elseView) {
          return;
        }

        this.removeChild(flags);
      }

      this.$child = this.elseView || (this.elseView = this.elseBehavior.factory.create());
      this.addChild(flags);
    } else if (this.$child) {
      this.removeChild(flags);
    }
  }

  private addChild(flags: BindingFlags): void {
    this.$child.$bind(flags, this.$scope);
    this.$child.onRender = view => view.$nodes.insertBefore(this.location);

    if (this.$isAttached) {
      this.$child.$attach(this.encapsulationSource);
    }
  }

  private removeChild(flags: BindingFlags): void {
    this.$child.$detach();
    this.$child.$unbind(flags);
  }
}

@templateController('else')
@inject(IViewFactory)
export class Else {
  private ifBehavior: If;

  constructor(public factory: IViewFactory) {}

  public link(ifBehavior: If): void {
    if (this.ifBehavior !== ifBehavior) {
      this.ifBehavior = ifBehavior;
      ifBehavior.link(this);
    }
  }
}
