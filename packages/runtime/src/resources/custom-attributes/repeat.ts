import { IIndexable, inject, IRegistry } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { IBindScope, IRenderable, IView, IViewFactory, State } from '../../lifecycle';
import { CollectionObserver, IBatchedCollectionSubscriber, IObservedArray, IScope, LifecycleFlags, ObservedCollection } from '../../observation';
import { BindingContext, Scope } from '../../observation/binding-context';
import { getCollectionObserver } from '../../observation/observer-locator';
import { SetterObserver } from '../../observation/setter-observer';
import { bindable } from '../../templating/bindable';
import { ICustomAttribute, ICustomAttributeResource, templateController } from '../custom-attribute';

export interface Repeat<C extends ObservedCollection, T extends INode = INode> extends ICustomAttribute<T>, IBatchedCollectionSubscriber {}

@inject(IRenderLocation, IRenderable, IViewFactory)
@templateController('repeat')
export class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements Repeat<C, T> {
  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  @bindable public items: C;

  public $scope: IScope;
  public $observers: { items: SetterObserver };

  public forOf: ForOfStatement;
  public hasPendingInstanceMutation: boolean;
  public local: string;
  public location: IRenderLocation<T>;
  public observer: CollectionObserver | null;
  public renderable: IRenderable<T>;
  public factory: IViewFactory<T>;
  public views: IView<T>[];

  constructor(
    location: IRenderLocation<T>,
    renderable: IRenderable<T>,
    factory: IViewFactory<T>
  ) {
    this.factory = factory;
    this.hasPendingInstanceMutation = false;
    this.location = location;
    this.observer = null;
    this.renderable = renderable;
    this.views = [];
  }

  public binding(flags: LifecycleFlags): void {
    this.checkCollectionObserver();
  }

  public bound(flags: LifecycleFlags): void {
    let current = this.renderable.$bindableHead;
    while (current !== null) {
      if ((current as Binding).target === this && (current as Binding).targetProperty === 'items') {
        this.forOf = (current as Binding).sourceExpression as ForOfStatement;
        break;
      }
      current = (current as IBindScope).$nextBind;
    }
    this.local = this.forOf.declaration.evaluate(flags, this.$scope, null) as string;

    this.processViews(null, flags);
  }

  public attaching(flags: LifecycleFlags): void {
    const { views, location } = this;
    for (let i = 0, ii = views.length; i < ii; ++i) {
      const view = views[i];
      view.hold(location);
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
  public itemsChanged(newValue: C, oldValue: C, flags: LifecycleFlags): void {
    this.checkCollectionObserver();
    this.processViews(null, flags | LifecycleFlags.updateTargetInstance);
  }

  // called by a CollectionObserver (async)
  public handleBatchedChange(indexMap: number[] | null): void {
    this.processViews(indexMap, LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance);
  }

  // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
  // TODO: Reduce complexity (currently at 46)
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
        forOf.iterate(items, (arr, i, item: (string | number | boolean | ObservedCollection | IIndexable)) => {
          const view = views[i];
          if (!!view.$scope && view.$scope.bindingContext[local] === item) {
            view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
          } else {
            view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
          }
        });
      } else {
        forOf.iterate(items, (arr, i, item: (string | number | boolean | ObservedCollection | IIndexable)) => {
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
          view.hold(location);
          view.$attach(flags);
        }
      } else {
        for (let i = 0, ii = views.length; i < ii; ++i) {
          if (indexMap[i] !== i) {
            const view = views[i];
            view.hold(location);
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
      if (oldObserver !== newObserver && oldObserver) {
        oldObserver.unsubscribeBatched(this);
      }
      if (newObserver) {
        newObserver.subscribeBatched(this);
      }
    } else if (oldObserver) {
      oldObserver.unsubscribeBatched(this);
    }
  }
}
