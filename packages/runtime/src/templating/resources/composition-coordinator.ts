import { PLATFORM } from '@aurelia/kernel';
import { Lifecycle } from '../../lifecycle';
import { BindingFlags, IScope } from '../../observation';
import { IView } from '../view';

export class CompositionCoordinator {
  public onSwapComplete: () => void = PLATFORM.noop;

  private currentView: IView = null;
  private scope: IScope;
  private isBound: boolean = false;
  private isAttached: boolean = false;

  public compose(value: IView): void {
    this.swap(value);
  }

  public binding(flags: BindingFlags, scope: IScope): void {
    this.scope = scope;
    this.isBound = true;

    if (this.currentView !== null) {
      this.currentView.$bind(flags, scope);
    }
  }

  public attaching(): void {
    this.isAttached = true;

    if (this.currentView !== null) {
      this.currentView.$attach();
    }
  }

  public detaching(): void {
    this.isAttached = false;

    if (this.currentView !== null) {
      this.currentView.$detach();
    }
  }

  public unbinding(flags: BindingFlags): void {
    this.isBound = false;

    if (this.currentView !== null) {
      this.currentView.$unbind(flags);
    }
  }

  public caching(): void {
    this.currentView = null;
  }


  private swap(view: IView): void {
    if (this.currentView === view) {
      return;
    }

    if (this.currentView !== null) {
      Lifecycle.beginDetach();
      this.currentView.$detach();
      Lifecycle.endDetach();

      this.currentView.$unbind(BindingFlags.fromUnbind);
    }

    this.currentView = view;

    if (this.currentView !== null) {
      if (this.isBound) {
        this.currentView.$bind(BindingFlags.fromBindableHandler, this.scope);
      }

      if (this.isAttached) {
        Lifecycle.beginAttach();
        this.currentView.$attach();
        Lifecycle.endAttach();
      }
    }

    this.onSwapComplete();
  }
}
