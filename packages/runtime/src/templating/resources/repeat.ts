import { IContainer, Immutable, inject, PLATFORM, Registration } from '@aurelia/kernel';
import { getArrayObserver } from '../../binding/array-observer';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { IOverrideContext, IScope } from '../../binding/binding-context';
import { BindingFlags } from '../../binding/binding-flags';
import { BindingMode } from '../../binding/binding-mode';
import { IChangeSet } from '../../binding/change-set';
import { getMapObserver } from '../../binding/map-observer';
import { CollectionKind, CollectionObserver, ObservedCollection } from '../../binding/observation';
import { getSetObserver } from '../../binding/set-observer';
import { INode, IRenderLocation } from '../../dom';
import { IResourceKind, IResourceType } from '../../resource';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeSource } from '../custom-attribute';
import { AttachLifecycle, DetachLifecycle } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IRenderingEngine } from '../rendering-engine';
import { IRuntimeBehavior, RuntimeBehavior } from '../runtime-behavior';
import { IView, IViewFactory } from '../view';
import { IBatchedCollectionSubscriber } from './../../binding/observation';

export function getCollectionObserver(changeSet: IChangeSet, collection: any): CollectionObserver {
  if (Array.isArray(collection)) {
    return <any>getArrayObserver(changeSet, collection);
  } else if (collection instanceof Map) {
    return <any>getMapObserver(changeSet, collection);
  } else if (collection instanceof Set) {
    return <any>getSetObserver(changeSet, collection);
  }
}

@inject(IChangeSet, IRenderLocation, IRenderable, IViewFactory, IContainer)
export class Repeat<T extends ObservedCollection> implements ICustomAttribute, IBatchedCollectionSubscriber {
  public static kind: IResourceKind<ICustomAttributeSource, IResourceType<ICustomAttributeSource, ICustomAttribute>> = CustomAttributeResource;
  public static description: Immutable<Required<ICustomAttributeSource>> = {
    name: 'repeat',
    aliases: PLATFORM.emptyArray,
    defaultBindingMode: BindingMode.toView,
    isTemplateController: true,
    bindables: {
      items: { attribute: 'items', mode: BindingMode.toView, property: 'items' },
      local: { attribute: 'local', mode: BindingMode.toView, property: 'local' }
    }
  };
  public static register(container: IContainer): void {
    container.register(Registration.transient('custom-attribute:repeat', Repeat));
  }
  // tslint:disable:member-ordering
  public $changeCallbacks: (() => void)[] = [];
  public $isAttached: boolean = false;
  public $isBound: boolean = false;
  public $scope: IScope = null;
  public $behavior: IRuntimeBehavior = new (<any>RuntimeBehavior)();
  public $hydrate(renderingEngine: IRenderingEngine): void {
    let b: RuntimeBehavior = renderingEngine['behaviorLookup'].get(Repeat);
    if (!b) {
      b = new (<any>RuntimeBehavior)();
      b.bindables = Repeat.description.bindables;
      b.hasCreated = b.hasAttaching = b.hasAttached = b.hasDetaching = b.hasDetached = b.hasRender = false;
      b.hasBound = b.hasUnbound = true;
      renderingEngine['behaviorLookup'].set(Repeat, b);
    }
    this.$behavior = b;
  }

  private _oldItems: any[]; // this is purely used by instanceMutation to see if items can be reused
  private _items: T & { $observer: CollectionObserver };
  public set items(newValue: T & { $observer: CollectionObserver }) {
    const oldValue = this._items;
    if (oldValue === newValue) {
      // don't do anything if the same instance is re-assigned (the existing observer should pick up on any changes)
      return;
    }
    this._items = newValue;
    this.hasPendingInstanceMutation = true;
    if (this.$isBound) {
      this.changeSet.add(this);
    }
  }
  public get items(): T & { $observer: CollectionObserver } {
    return this._items;
  }

  public encapsulationSource: INode;
  public views: IView[] = [];
  public local: string;
  public viewsRequireLifecycle: boolean;
  public observer: CollectionObserver;
  public hasPendingInstanceMutation: boolean;
  public sourceExpression: ForOfStatement;

  constructor(public changeSet: IChangeSet, public location: IRenderLocation, public renderable: IRenderable, public factory: IViewFactory, public container: IContainer) {
    this.encapsulationSource = null;
    this.observer = null;
    this.hasPendingInstanceMutation = false;
  }
  // tslint:enable:member-ordering

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }
    this.$scope = scope;
    this.$isBound = true;
    this.sourceExpression = <any>(<Binding[]>this.renderable.$bindables).find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
    if (this.hasPendingInstanceMutation) {
      this.changeSet.add(this);
    }
  }
  public $attach(encapsulationSource: INode, lifecycle: AttachLifecycle): void {
    this.encapsulationSource = encapsulationSource;
    this.$isAttached = true;
  }
  public $detach(lifecycle: DetachLifecycle): void {
    this.$isAttached = false;
    this.encapsulationSource = null;
  }
  public $unbind(flags: BindingFlags): void {
    if (this.$isBound) {
      this.$isBound = false;
      this.observer.unsubscribeBatched(this);
      this.observer = this._items = null;
      // if this is a re-bind triggered by some ancestor repeater, then keep the views so we can reuse them
      // (this flag is passed down from handleInstanceMutation/handleItemsMutation down below at view.$bind)
      if (!(flags & (BindingFlags.instanceMutation | BindingFlags.itemsMutation))) {
        this.removeAllViews();
      }
    }
  }

  public flushChanges(): void {
    this.handleBatchedChange();
  }

  public handleBatchedChange(indexMap?: number[]): void {
    if (this.hasPendingInstanceMutation) {
      if (this.observer !== null) {
        this.observer.unsubscribeBatched(this);
      }
      const items = this._items;
      this.observer = getCollectionObserver(this.changeSet, items);
      this.observer.subscribeBatched(this);
      this.handleBatchedItemsOrInstanceMutation();
      this._oldItems = Array.isArray(items) ? items.slice() : Array.from(items);
    } else {
      this.handleBatchedItemsOrInstanceMutation(indexMap);
    }
  }

  // if the indexMap === undefined, it is an instance mutation, otherwise it's an items mutation
  private handleBatchedItemsOrInstanceMutation(indexMap?: number[]): void {
    // determine if there is anything to process and whether or not we can return early
    const location = this.location;
    const views = this.views;
    const _items = this._items;
    const observer = this.observer;
    const oldLength = views.length;
    const newLength = _items[observer.lengthPropertyName];
    if (newLength === 0) {
      if (oldLength === 0) {
        // if we had 0 items and still have 0 items, we don't need to do anything
        return;
      } else {
        // if we had >0 items and now have 0 items, just remove all and return
        this.removeAllViews();
        return;
      }
    }

    const isAttached = this.$isAttached;
    const items = <any[]>(observer.collectionKind & CollectionKind.indexed ? _items : Array.from(_items)); // todo: test and improve this (offload it to IteratorStatement?)

    // store the scopes of the current indices so we can reuse them for other views
    const previousScopes = new Array<IScope>(oldLength);
    let i = 0;
    while (i < oldLength) {
      previousScopes[i] = views[i].$scope;
      i++;
    }

    let flags = BindingFlags.none;
    const scope = this.$scope;
    const overrideContext = scope.overrideContext;
    const local = this.local;

    if (oldLength < newLength) {
      // expand the array (we add the views later)
      views.length = newLength;
    } else if (newLength < oldLength) {
      // remove any surplus views
      i = newLength;
      const lifecycle = DetachLifecycle.start(this);
      while (i < oldLength) {
        const view = views[i++];
        if (isAttached) {
          view.$detach(lifecycle);
        }
        view.tryReturnToCache();
      }
      lifecycle.end(this);
      views.length = newLength;
    }

    const oldItems = this._oldItems || [];
    let getPreviousIndex;

    if (indexMap === undefined) {
      flags |= BindingFlags.instanceMutation;
      getPreviousIndex = (_, item) => oldItems.indexOf(item); // this is super inefficient with large collections, maybe we shouldn't do this (or put an upper bound / have some smarter logic)
      this.hasPendingInstanceMutation = false;
    } else {
      flags |= BindingFlags.itemsMutation;
      getPreviousIndex = (curIdx) => indexMap[curIdx];
    }

    const factory = this.factory;
    const encapsulationSource = this.encapsulationSource;
    const lifecycle = AttachLifecycle.start(this);
    i = 0;
    while (i < newLength) {
      let view = views[i];
      const item = items[i];
      if (view === undefined) {
        // add view if it doesn't exist yet
        view = views[i] = factory.create();
        view.$bind(flags, createChildScope(overrideContext, { [local]: item }));
        view.onRender = () => {
          view.$nodes.insertBefore(location);
        };
        if (isAttached) {
          view.$attach(encapsulationSource, lifecycle);
        }
      } else {
        // a very cheap (and fairly niche) check to see if we can skip processing alltogether
        // note: it doesn't matter if the lengths are different; an item out of bounds will simply return undefined
        if (item !== oldItems[i]) {
          const previousIndex = getPreviousIndex(i, item);
          if (previousIndex > -1 && previousIndex < oldLength) {
            // ensure we don't reuse the same previousIndex multiple times in case we happen to have multiple of the same items
            oldItems[previousIndex] = undefined;
            view.$bind(flags, previousScopes[previousIndex]);
          } else {
            view.$bind(flags, createChildScope(overrideContext, { [local]: item }));
          }
        }
      }
      i++;
    }
    lifecycle.end(this);
  }

  private removeAllViews(): void {
    const views = this.views;
    this.views = [];
    const len = views.length;
    let i = 0;
    const isAttached = this.$isAttached;
    const lifecycle = DetachLifecycle.start(this);
    while (i < len) {
      const view = views[i++];
      if (isAttached) {
        view.$detach(lifecycle);
      }
      view.tryReturnToCache();
    }
    lifecycle.end(this);
  }
}

Repeat.prototype.observer = null;

function createChildScope(parentOverrideContext: IOverrideContext, bindingContext: { [key: string]: any }): IScope {
  return {
    bindingContext,
    overrideContext: {
      bindingContext,
      parentOverrideContext
    }
  };
}
