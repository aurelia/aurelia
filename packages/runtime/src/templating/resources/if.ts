import { inject } from '@aurelia/kernel';
import { BindingFlags } from '../../binding';
import { DOM, INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IView, IViewFactory } from '../view';

export interface If extends ICustomAttribute {}
@templateController('if')
@inject(IViewFactory, IRenderLocation)
export class If {
  @bindable public value: boolean = false;
  public elseFactory: IViewFactory;

  private ifView: IView;
  private elseView: IView;

  private $child: IView;
  private encapsulationSource: INode;

  constructor(public ifFactory: IViewFactory, private location: IRenderLocation) {}

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

  private update(shouldRenderTrueBranch: boolean, flags: BindingFlags): void {
    if (shouldRenderTrueBranch) {
      this.activateBranch('if', flags);
    } else if (this.elseFactory) {
      this.activateBranch('else', flags);
    } else if (this.$child) {
      this.deactivateCurrentBranch(flags);
    }
  }

  private activateBranch(name: 'if' | 'else', flags: BindingFlags): void {
    const branchView = this.ensureViewCreated(name);

    if (this.$child) {
      if (this.$child === branchView) {
        return;
      }

      this.deactivateCurrentBranch(flags);
    }

    this.$child = branchView;
    branchView.$bind(flags, this.$scope);

    if (this.$isAttached) {
      branchView.$attach(this.encapsulationSource);
    }
  }

  private ensureViewCreated(name: 'if' | 'else'): IView {
    const viewPropertyName = `${name}View`;
    let branchView = this[viewPropertyName] as IView;

    if (!branchView) {
      this[viewPropertyName] = branchView
        = (this[`${name}Factory`] as IViewFactory).create();
      branchView.onRender = view => view.$nodes.insertBefore(this.location);
    }

    return branchView;
  }

  private deactivateCurrentBranch(flags: BindingFlags): void {
    this.$child.$detach();
    this.$child.$unbind(flags);
    this.$child = null;
  }
}

@templateController('else')
@inject(IViewFactory, IRenderLocation)
export class Else {
  constructor(private factory: IViewFactory, location: IRenderLocation) {
    DOM.remove(location); // Only the location of the "if" is relevant.
  }

  public link(ifBehavior: If): void {
    ifBehavior.elseFactory = this.factory;
  }
}
