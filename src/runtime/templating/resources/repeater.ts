import { ObservedCollection, CollectionObserver, CollectionKind } from '../../binding/observers/collection-observer';
import { ICustomAttributeSource, CustomAttributeResource } from '../custom-attribute';
import { AttachLifecycle, DetachLifecycle } from '../lifecycle';
import { IRuntimeBehavior, RuntimeBehavior } from '../runtime-behavior';
import { IRenderingEngine } from '../rendering-engine';
import { PLATFORM } from '../../../kernel/platform';
import { IContainer, inject, Registration } from '../../../kernel/di';
import { getArrayObserver } from '../../binding/observers/array-observer';
import { ITaskQueue } from '../../task-queue';
import { IRenderSlot } from '../render-slot';
import { IViewOwner } from '../view';
import { IVisualFactory, IVisual } from '../visual';
import { IScope, IOverrideContext } from '../../binding/binding-context';
import { ForOfStatement } from '../../binding/ast';
import { Binding, BindingMode, BindingFlags } from '../../binding/binding';
import { Immutable } from '../../../kernel/interfaces';
import { IResourceKind, IResourceType } from '../../resource';
import { INode } from '../../dom';
import { ICustomAttribute } from '../custom-attribute';
import { getMapObserver } from '../../binding/observers/map-observer';
import { getSetObserver } from '../../binding/observers/set-observer';


export function getCollectionObserver(collection: any): CollectionObserver {
  if (Array.isArray(collection)) {
    return <any>getArrayObserver(collection);
  } else if (collection instanceof Map) {
    return <any>getMapObserver(collection);
  } else if (collection instanceof Set) {
    return <any>getSetObserver(collection);
  }
}

@inject(ITaskQueue, IRenderSlot, IViewOwner, IVisualFactory, IContainer)
export class Repeater<T extends ObservedCollection> implements ICustomAttribute {
  // note: everything declared from #region to #endregion is more-or-less copy-paste from what the
  // @templateController decorator would apply to this class, but we have more information here than the decorator
  // does, so we can take a few shortcuts for slightly better perf (and one can argue that this makes the repeater
  // as a whole easier to understand)

  // #region custom-attribute definition
  // attribute
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
    container.register(Registration.transient('custom-attribute:repeat', Repeater));
  }

  // attribute proto.$hydrate
  public $changeCallbacks: (() => void)[] = [];
  public $isAttached: boolean = false;
  public $isBound: boolean = false;
  public $scope: IScope = null;
  public $slot: IRenderSlot;
  public $behavior: IRuntimeBehavior = new (<any>RuntimeBehavior)();
  public $hydrate(renderingEngine: IRenderingEngine): void {
    let b: RuntimeBehavior = renderingEngine['behaviorLookup'].get(Repeater);
    if (!b) {
      b = new (<any>RuntimeBehavior)();
      b.bindables = Repeater.description.bindables;
      b.hasCreated = b.hasAttaching = b.hasAttached = b.hasDetaching = b.hasDetached = b.hasCreateView = false;
      b.hasBound = b.hasUnbound = true;
      renderingEngine['behaviorLookup'].set(Repeater, b);
    }
    this.$behavior = b;
  }

  // attribute proto.$bind
  public $bind(flags: BindingFlags, scope: IScope): void {      
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags);
    }
    this.$scope = scope
    this.$isBound = true;
    this.bound(flags, scope);
  }

  // attribute proto.$attach
  public $attach(encapsulationSource: INode, lifecycle: AttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }
    if (this.$slot !== null) {
      this.$slot.$attach(encapsulationSource, lifecycle);
    }
    this.$isAttached = true;
  }
  // attribute proto.$detach
  public $detach(lifecycle: DetachLifecycle): void {
    if (this.$isAttached) {
      if (this.$slot !== null) {
        this.$slot.$detach(lifecycle);
      }
      this.$isAttached = false;
    }
  }
  // attribute proto.$unbind
  public $unbind(flags: BindingFlags): void {
    if (this.$isBound) {
      this.unbound(flags);
      this.$isBound = false;
    }
  }
  // #endregion

  
  private _previousItems: Array<any>;
  private _items: T & { $observer: CollectionObserver };
  public set items(newValue: T & { $observer: CollectionObserver }) {
    const oldValue = this._items;
    if (oldValue === newValue) {
      // don't do anything if the same instance is re-assigned (the existing observer should pick up on any changes)
      return;
    }
    if (oldValue && oldValue.$observer) {
      const oldObserver = oldValue.$observer;
      this._previousItems = <any[]>(oldObserver.collectionKind & CollectionKind.indexed ? (<any[]>oldValue).slice() : Array.from(oldValue)); // todo: optimize / offload to IteratorStatement
    } else {
      this._previousItems = [];
    }
    this._items = newValue;
    if (this.isBound) {
      // only re-subscribe and queue if we're bound; otherwise bound() below will pick up hasPendingInstanceMutation
      // and act accordingly
      this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.unsubscribeBatched(this.handleBatchedItemsOrInstanceMutation);
      if (newValue !== null && newValue !== undefined) {
        this.observer = getCollectionObserver(newValue);
        this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
        this.observer.subscribeBatched(this.handleBatchedItemsOrInstanceMutation);
      }
      this.tq.queueMicroTask(this);
    }
    this.hasPendingInstanceMutation = true;
  }
  public get items(): T & { $observer: CollectionObserver } {
    return this._items;
  }

  private _local: string;
  public get local(): string {
    return this._local || this.sourceExpression.declaration.name;
  }
  public set local(value: string) {
    this._local = value;
  }

  public visualsRequireLifecycle: boolean;

  public scope: IScope;
  public observer: CollectionObserver;
  public isQueued: boolean;
  public isBound: boolean;
  public hasPendingInstanceMutation: boolean;
  public sourceExpression: ForOfStatement;

  constructor(public tq: ITaskQueue, public slot: IRenderSlot, public owner: IViewOwner, public factory: IVisualFactory, public container: IContainer) {
    this.scope = null;
    this.observer = null;
    this.isQueued = false;
    this.isBound = false;
    this.hasPendingInstanceMutation = false;
  }

  /**
   * Process any pending array or instance mutations
   * - called by the TaskQueue
   */
  public call(): void {
    this.isQueued = false;
    if (this.hasPendingInstanceMutation) {
      // if a new array instance is assigned, disregard the observer state and start from scratch
      if (this.observer.hasChanges) {
        this.observer.resetIndexMap();
        this.observer.hasChanges = false;
      }
      this.handleBatchedItemsOrInstanceMutation();
    } else {
      this.observer.flushChanges();
    }
    // only use the connectQueue on first load
    //this.defaultFlags |= BindingFlags.connectImmediate;
  }

  /**
   * Initialize array observation and process any pending instance mutation (if this is a re-bind)
   * - called by $bind
   */
  public bound(flags: BindingFlags, scope: IScope): void {
    this.sourceExpression = <any>(<Binding[]>this.owner.$bindable).find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
    this.scope = scope;
    this.observer = getCollectionObserver(this._items);
    this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.subscribeBatched(this.handleBatchedItemsOrInstanceMutation);
    this.isBound = true;
    if (this.hasPendingInstanceMutation) {
      this.handleBatchedItemsOrInstanceMutation();
    }
  }

  /**
   * Cleanup subscriptions and remove rendered items from the DOM
   * - called by $unbind
   */
  public unbound(flags: BindingFlags): void {
    this.isBound = false;
    this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.unsubscribeBatched(this.handleBatchedItemsOrInstanceMutation);
    this.observer = this._items = null;
    // if this is a re-bind triggered by some ancestor repeater, then keep the visuals so we can reuse them
    // (this flag is passed down from handleInstanceMutation/handleItemsMutation down below at visual.$bind)
    if (!(flags & (BindingFlags.instanceMutation | BindingFlags.itemsMutation))) {
      this.slot.removeAll(true, true);
    }
  }

  /**
   * Queue this.call() in the TaskQueue
   * - called automatically by the ArrayObserver on any array mutation
   */
  private handleImmediateItemsMutation = (): void => {
    if (this.isQueued === false) {
      this.isQueued = true;
      this.tq.queueMicroTask(this);
    }
  };

  // if the indexMap === undefined, it is an instance mutation, otherwise it's an items mutation
  private handleBatchedItemsOrInstanceMutation = (indexMap?: Array<number>): void => {
    // determine if there is anything to process and whether or not we can return early
    const slot = this.slot;
    const visuals = <IVisual[]>slot.children;
    const _items = this._items;
    const observer = this.observer;
    const oldLength = visuals.length;
    const newLength = _items[observer.lengthPropertyName];
    if (newLength === 0) {
      if (oldLength === 0) {
        // if we had 0 items and still have 0 items, we don't need to do anything
        return;
      } else {
        // if we had >0 items and now have 0 items, just remove all and return
        this.slot.removeAll(true, true);
        return;
      }
    }

    const isAttached = slot['$isAttached'];
    const items = <any[]>(observer.collectionKind & CollectionKind.indexed ? _items : Array.from(_items)); // todo: test and improve this (offload it to IteratorStatement?)

    // store the scopes of the current indices so we can reuse them for other visuals
    const previousScopes = new Array<IScope>(oldLength);
    let i = 0;
    while (i < oldLength) {
      previousScopes[i] = visuals[i].$scope;
      i++;
    }

    let flags = BindingFlags.none;
    const scope = this.scope;
    const overrideContext = scope.overrideContext;
    const local = this.local;

    if (oldLength < newLength) {
      // expand the array (we add the visuals later)
      visuals.length = newLength;
    } else if (newLength < oldLength) {
      // remove any surplus visuals
      i = newLength;
      while (i < oldLength) {
        const visual = visuals[i];
        if (isAttached) {
          visual.$detach();
        }
        visual.tryReturnToCache();
        i++;
      }
      visuals.length = newLength;
    }

    const previousItems = this._previousItems;
    let getPreviousIndex;

    if (indexMap === undefined) {
      flags |= BindingFlags.instanceMutation;
      getPreviousIndex = (_, item) => previousItems.indexOf(item); // this is super inefficient with large collections, maybe we shouldn't do this (or put an upper bound / have some smarter logic)
      this.hasPendingInstanceMutation = false;
    } else {
      flags |= BindingFlags.itemsMutation;
      getPreviousIndex = (curIdx) => indexMap[curIdx];
    }

    const factory = this.factory;
    i = 0;
    while (i < newLength) {
      let visual = visuals[i];
      const item = items[i];
      if (visual === undefined) {
        // add visual if it doesn't exist yet
        visual = visuals[i] = factory.create();
        visual.$bind(flags, createChildScope(overrideContext, { [local]: item }));
        visual.parent = slot;
        visual.onRender = slot['addVisualCore'];
        if (isAttached) {
          visual.$attach(slot['encapsulationSource']);
        }
      } else {
        // a very cheap (and fairly niche) check to see if we can skip processing alltogether
        // note: it doesn't matter if the lengths are different; an item out of bounds will simply return undefined
        if (item !== previousItems[i]) {
          const previousIndex = getPreviousIndex(i, item);
          if (previousIndex > -1 && previousIndex < oldLength) {
            // ensure we don't reuse the same previousIndex multiple times in case we happen to have multiple of the same items
            previousItems[previousIndex] = undefined;
            visual.$bind(flags, previousScopes[previousIndex]);
          } else {
            visual.$bind(flags, createChildScope(overrideContext, { [local]: item }));
          }
        }
      }
      i++;
    }
  }
}

function createChildScope(parentOverrideContext: IOverrideContext, bindingContext: { [key: string]: any }): IScope {
  return {
    bindingContext,
    overrideContext: {
      bindingContext,
      parentOverrideContext
    }
  };
}
