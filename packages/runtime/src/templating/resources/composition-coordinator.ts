import { IContainer, inject, IResolver, PLATFORM, Registration } from '@aurelia/kernel';
import { ILifecycle } from '../../lifecycle';
import { IScope, LifecycleFlags } from '../../observation';
import { IView } from '../view';

@inject(ILifecycle)
export class CompositionCoordinator {
  public onSwapComplete: () => void = PLATFORM.noop;

  private currentView: IView = null;
  private scope: IScope;
  private isBound: boolean = false;
  private isAttached: boolean = false;

  constructor(public readonly $lifecycle: ILifecycle) {}

  public static register(container: IContainer): IResolver<CompositionCoordinator> {
    return Registration.transient(this, this).register(container, this);
  }

  public compose(value: IView, flags: LifecycleFlags): void {
    this.swap(value, flags);
  }

  public binding(flags: LifecycleFlags, scope: IScope): void {
    this.scope = scope;
    this.isBound = true;

    if (this.currentView !== null) {
      this.currentView.$bind(flags, scope);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    this.isAttached = true;

    if (this.currentView !== null) {
      this.currentView.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    this.isAttached = false;

    if (this.currentView !== null) {
      this.currentView.$detach(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    this.isBound = false;

    if (this.currentView !== null) {
      this.currentView.$unbind(flags);
    }
  }

  public caching(flags: LifecycleFlags): void {
    this.currentView = null;
  }

  private swap(view: IView, flags: LifecycleFlags): void {
    if (this.currentView === view) {
      return;
    }

    const $lifecycle = this.$lifecycle;
    if (this.currentView !== null) {
      if (this.isAttached) {
        $lifecycle.beginDetach();
        this.currentView.$detach(flags);
        $lifecycle.endDetach(flags);
      }
      if (this.isBound) {
        $lifecycle.beginUnbind();
        this.currentView.$unbind(flags);
        $lifecycle.endUnbind(flags);
      }
    }

    this.currentView = view;

    if (this.currentView !== null) {
      if (this.isBound) {
        $lifecycle.beginBind();
        this.currentView.$bind(flags, this.scope);
        $lifecycle.endBind(flags);
      }
      if (this.isAttached) {
        $lifecycle.beginAttach();
        this.currentView.$attach(flags);
        $lifecycle.endAttach(flags);
      }
    }

    this.onSwapComplete();
  }
}
