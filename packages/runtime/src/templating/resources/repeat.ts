import { inject } from '@aurelia/kernel';
import { Binding, BindingContext, BindingFlags, CollectionObserver, ForOfStatement, getCollectionObserver, IBatchedCollectionSubscriber, IChangeSet, IObservedArray, IScope, ObservedCollection, SetterObserver, Scope } from '../../binding';
import { INode, IRenderLocation } from '../../dom';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle, Lifecycle, LifecycleFlags } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IView, IViewFactory } from '../view';

export interface Repeat<T extends ObservedCollection> extends ICustomAttribute, IBatchedCollectionSubscriber {}

const batchedChangesFlags = BindingFlags.fromFlushChanges | BindingFlags.fromBind;

@inject(IChangeSet, IRenderLocation, IRenderable, IViewFactory)
@templateController('repeat')
export class Repeat<T extends ObservedCollection = IObservedArray> {
  @bindable public items: T;

  public $isAttached: boolean;
  public $isBound: boolean;
  public $scope: IScope;
  public $observers: { items: SetterObserver }

  public encapsulationSource: INode = null;
  public views: IView[] = [];
  public observer: CollectionObserver = null;
  public hasPendingInstanceMutation: boolean = false;

  public forOf: ForOfStatement;
  public local: string;

  constructor(
    public changeSet: IChangeSet,
    public location: IRenderLocation,
    public renderable: IRenderable,
    public factory: IViewFactory) { }

  public bound(flags: BindingFlags): void {
    this.forOf = (<Binding[]>this.renderable.$bindables).find(b => b.target === this).sourceExpression as ForOfStatement;
    this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);

    this.processViews(null, flags);
    this.checkCollectionObserver();
  }

  public attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    const { views, location } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.mount(location);
      view.$attach(encapsulationSource, lifecycle);
    }
  }

  public detaching(lifecycle: IDetachLifecycle): void {
    const { views } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.$detach(lifecycle);
      view.release();
    }
  }

  public unbound(flags: BindingFlags): void {
    this.checkCollectionObserver();

    const { views } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.$unbind(flags);
    }
  }

  // called by SetterObserver (sync)
  public itemsChanged(newValue: T, oldValue: T, flags: BindingFlags): void {
    this.checkCollectionObserver();
    this.processViews(null, flags | BindingFlags.updateTargetInstance);
  }

  // called by a CollectionObserver (async)
  public handleBatchedChange(indexMap: number[] | null): void {
    this.processViews(indexMap, BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance);
  }

  // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
  private processViews(indexMap: number[] | null, flags: BindingFlags): void {
    const views = this.views;
    if (this.$isBound) {
      const { local, $scope, factory, forOf, items } = this;
      const oldLength = views.length;
      const newLength = forOf.count(items);
      if (oldLength < newLength) {
        views.length = newLength;
        for (let i = oldLength; i < newLength; ++i) {
          views[i] = factory.create();
        }
      } else if (newLength < oldLength) {
        const lifecycle = Lifecycle.beginDetach(LifecycleFlags.unbindAfterDetached);
        for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
          view.release();
          lifecycle.detach(view);
        }
        lifecycle.end();
        views.length = newLength;
        if (newLength === 0) {
          return;
        }
      } else if (newLength === 0) {
        return;
      }

      if (indexMap === null) {
        forOf.iterate(items, (arr, i, item) => {
          const view = views[i];
          if (!!view.$scope && view.$scope.bindingContext[local] === item) {
            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
          } else {
            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
          }
        });
      } else {
        forOf.iterate(items, (arr, i, item) => {
          const view = views[i];
          if (indexMap[i] === i) {
            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
          } else {
            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
          }
        });
      }
    }

    if (this.$isAttached) {
      const { location } = this;
      const lifecycle = Lifecycle.beginAttach(this.encapsulationSource, LifecycleFlags.none);
      if (indexMap === null) {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          const view = views[i];
          view.mount(location);
          lifecycle.attach(view);
        }
      } else {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          if (indexMap[i] !== i) {
            const view = views[i];
            view.mount(location);
            lifecycle.attach(view);
          }
        }
      }
      lifecycle.end();
    }
  }

  private checkCollectionObserver(): void {
    const oldObserver = this.observer;
    if (this.$isBound) {
      const newObserver = this.observer = getCollectionObserver(this.changeSet, this.items);
      if (oldObserver !== newObserver) {
        if (oldObserver) {
          oldObserver.unsubscribeBatched(this);
        }
        if (newObserver) {
          newObserver.subscribeBatched(this);
        }
      }
    } else if (oldObserver) {
      oldObserver.unsubscribeBatched(this);
    }
  }
}
