import { inject, IRegistry } from '../../../kernel';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { BindingContext, Scope } from '../../binding/binding-context';
import { getCollectionObserver } from '../../binding/observer-locator';
import { SetterObserver } from '../../binding/property-observation';
// import { INode, IRenderLocation } from '../../dom';
import { IRenderable, IView, IViewFactory, State } from '../../lifecycle';
import { CollectionObserver, IBatchedCollectionSubscriber, IObservedArray, IScope, LifecycleFlags, ObservedCollection } from '../../observation';
import { bindable } from '../bindable';
import { ICustomAttribute, templateController } from '../custom-attribute';
import { IFabricRenderLocation, IFabricNode } from '../../three-dom';
import { I3VNode } from 'runtime/three-vnode';

export interface Repeat<T extends ObservedCollection> extends ICustomAttribute, IBatchedCollectionSubscriber {}

@inject(IFabricRenderLocation, IRenderable, IViewFactory)
@templateController('repeat')
export class Repeat<T extends ObservedCollection = IObservedArray> {
  public static register: IRegistry['register'];

  @bindable public items: T;

  public $scope: IScope;
  public $observers: { items: SetterObserver };

  public encapsulationSource: I3VNode = null;
  public views: IView[] = [];
  public observer: CollectionObserver = null;
  public hasPendingInstanceMutation: boolean = false;

  public forOf: ForOfStatement;
  public local: string;

  constructor(
    public location: IFabricRenderLocation,
    public renderable: IRenderable,
    public factory: IViewFactory) { }

  public binding(flags: LifecycleFlags): void {
    this.checkCollectionObserver();
  }

  public bound(flags: LifecycleFlags): void {
    let current = this.renderable.$bindableHead;
    while (current !== null) {
      if ((<Binding>current).target === this && (<Binding>current).targetProperty === 'items') {
        this.forOf = (<Binding>current).sourceExpression as ForOfStatement;
        break;
      }
      current = current.$nextBind;
    }
    this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);

    this.processViews(null, flags);
  }

  public attaching(flags: LifecycleFlags): void {
    const { views, location } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.hold(location, flags);
      view.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    const { views } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.$detach(flags);
      view.release(flags);
    }
  }

  public unbound(flags: LifecycleFlags): void {
    this.checkCollectionObserver();

    const { views } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.$unbind(flags);
    }
  }

  // called by SetterObserver (sync)
  public itemsChanged(newValue: T, oldValue: T, flags: LifecycleFlags): void {
    this.checkCollectionObserver();
    this.processViews(null, flags | LifecycleFlags.updateTargetInstance);
  }

  // called by a CollectionObserver (async)
  public handleBatchedChange(indexMap: number[] | null): void {
    this.processViews(indexMap, LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
  }

  // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
  private processViews(indexMap: number[] | null, flags: LifecycleFlags): void {
    const { views, $lifecycle } = this;
    if (this.$state & State.isBound) {
      const { local, $scope, factory, forOf, items } = this;
      const oldLength = views.length;
      const newLength = forOf.count(items);
      if (oldLength < newLength) {
        views.length = newLength;
        for (let i = oldLength; i < newLength; ++i) {
          views[i] = factory.create();
        }
      } else if (newLength < oldLength) {
        $lifecycle.beginDetach();
        for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
          view.release(flags);
          view.$detach(flags);
        }
        $lifecycle.endDetach(flags);
        $lifecycle.beginUnbind();
        for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
          view.$unbind(flags);
        }
        $lifecycle.endUnbind(flags);
        views.length = newLength;
        if (newLength === 0) {
          return;
        }
      } else if (newLength === 0) {
        return;
      }

      $lifecycle.beginBind();
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
          if (indexMap[i] === i && !!view.$scope) {
            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
          } else {
            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
          }
        });
      }
      $lifecycle.endBind(flags);
    }

    if (this.$state & State.isAttached) {
      const { location } = this;
      $lifecycle.beginAttach();
      if (indexMap === null) {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          const view = views[i];
          view.hold(location, flags);
          view.$attach(flags);
        }
      } else {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          if (indexMap[i] !== i) {
            const view = views[i];
            view.hold(location, flags);
            view.$attach(flags);
          }
        }
      }
      $lifecycle.endAttach(flags);
    }
  }

  private checkCollectionObserver(): void {
    const oldObserver = this.observer;
    if (this.$state & (State.isBound | State.isBinding)) {
      const newObserver = this.observer = getCollectionObserver(this.$lifecycle, this.items);
      if (oldObserver !== newObserver) {
        if (oldObserver) {
          oldObserver.unsubscribeBatched(this);
        }
      }
      if (newObserver) {
        newObserver.subscribeBatched(this);
      }
    } else if (oldObserver) {
      oldObserver.unsubscribeBatched(this);
    }
  }
}
