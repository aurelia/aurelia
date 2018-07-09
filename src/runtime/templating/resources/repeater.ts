import { Collection, CollectionObserver, CollectionKind } from './../../binding/observation/collection-observer';
import { ICustomAttributeSource, CustomAttributeResource } from '../custom-attribute';
import { AttachLifecycle, DetachLifecycle } from '../../templating/lifecycle';
import { IRuntimeBehavior, RuntimeBehavior } from '../../templating/runtime-behavior';
import { IRenderingEngine } from '../../templating/rendering-engine';
import { PLATFORM } from '../../../kernel/platform';
import { IRepeater } from './repeat/repeater';
import { IContainer, inject, Registration } from '../../../kernel/di';
import { ArrayObserver, getArrayObserver } from '../../binding/observation/array-observer';
import { ITaskQueue } from '../../task-queue';
import { IRenderSlot } from '../../templating/render-slot';
import { IViewOwner } from '../../templating/view';
import { IVisualFactory, IVisual } from '../../templating/visual';
import { IScope, IOverrideContext } from '../../binding/binding-context';
import { ForOfStatement } from '../../binding/ast';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../binding/binding-mode';
import { Immutable } from '../../../kernel/interfaces';
import { IResourceKind, IResourceType } from '../../resource';
import { INode } from '../../dom';
import { BindingFlags } from '../../binding/binding-flags';
import { ICustomAttribute } from '../custom-attribute';
import { getMapObserver } from '../../binding/observation/map-observer';
import { getSetObserver } from '../../binding/observation/set-observer';


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
export class Repeater<T extends Collection> implements Partial<IRepeater>, ICustomAttribute {
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
  public $bind(scope: IScope): void {      
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind();
    }
    this.$scope = scope
    this.$isBound = true;
    this.bound(scope);
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
  public $unbind(): void {
    if (this.$isBound) {
      this.unbound();
      this.$isBound = false;
    }
  }
  // #endregion

  private _items: T & { $observer: CollectionObserver };
  public set items(newValue: T & { $observer: CollectionObserver }) {
    const oldValue = this._items;
    if (oldValue === newValue) {
      // don't do anything if the same instance is re-assigned (the existing observer should pick up on any changes)
      return;
    }
    this._items = newValue;
    if (this.isBound) {
      // if already bound before, but currently unbound, then unbound will have taken care of unsubscribing
      this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
      this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
      if (newValue !== null && newValue !== undefined) {
        this.observer = getCollectionObserver(newValue);
        this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
        this.observer.subscribeBatched(this.handleBatchedItemsMutation);
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
  public observer: ArrayObserver;
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
      this.handleInstanceMutation(this.items);
    } else {
      this.observer.flushChanges();
    }
  }

  /**
   * Initialize array observation and process any pending instance mutation (if this is a re-bind)
   * - called by $bind
   */
  public bound(scope: IScope): void {
    this.sourceExpression = <any>(<Binding[]>this.owner.$bindable).find(b => b.target === this && b.targetProperty === 'items').sourceExpression;
    this.scope = scope;
    this.observer = getCollectionObserver(this.items);
    this.observer.subscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.subscribeBatched(this.handleBatchedItemsMutation);
    this.isBound = true;
    if (this.hasPendingInstanceMutation) {
      this.handleInstanceMutation(this.items);
    }
  }

  /**
   * Cleanup subscriptions and remove rendered items from the DOM
   * - called by $unbind
   */
  public unbound(): void {
    this.isBound = false;
    this.observer.unsubscribeImmediate(this.handleImmediateItemsMutation);
    this.observer.unsubscribeBatched(this.handleBatchedItemsMutation);
    this.observer = this.items = null;
    this.slot.removeAll(true, true);
  }

  /**
   * Add a new visual to this instance with the specified item in the bindingContext
   */
  public addVisual(visual: IVisual, item: any): void {
    const scope = createChildScope(this.scope.overrideContext, { [this.local]: item });
    visual.$bind(scope);
    visual.parent = this.slot;
    visual.onRender = this.slot['addVisualCore'];
    if (this.slot['$isAttached']) {
      visual.$attach(this.slot['encapsulationSource']);
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

  /**
   * Process all pending array mutations (add/move/remove), update bindings and views (if attached)
   * - called manually by ArrayObserver.flushChanges
   */
  private handleBatchedItemsMutation = (indexMap: Array<number>): void => {
    const visuals = <IVisual[]>this.slot.children;
    const items = this.observer.collectionKind & CollectionKind.indexed ? this.items : Array.from(this.items);
    const visualCount = visuals.length;
    const itemCount = items[this.observer.lengthPropertyName];
    if (visualCount === 0 && itemCount === 0) {
      return;
    }
    const previousVisuals = visuals.slice();
    const len = indexMap.length;
    let from = 0;
    let to = 0;
    while (to < len) {
      from = indexMap[to];
      if (from !== to) {
        if (from > -1) { // move
          visuals[to] = previousVisuals[from];
        } else { // add new (if it's not 0 or higher, it will always be -2 or lower)
          const visual = visuals[to] = this.factory.create();
          this.addVisual(visual, items[to]);
        }
      }
      to++;
    }
    visuals.length = len;
    const isAttached = this.slot['$isAttached'];
    to = 0;
    while (to < visualCount) {
      const visual = previousVisuals[to];
      if (visuals.indexOf(visual) === -1) {
        // remove
        if (isAttached) {
          visual.$detach();
        }
        visual.tryReturnToCache();
      }
      to++;
    }
    if (isAttached) {
      const container = this.container;
      to = 0;
      while (to < len) {
        // reorder the children by re-appending them to the parent
        // todo: use insertion to reorder the elements in fewer operations
        const visual = visuals[to];
        if (len > 1) {
          const firstChild = <Node>visual.$view.firstChild;
          const parent = firstChild.parentNode;
          let current = parent.childNodes.item(to);
          while (current !== firstChild) {
            parent.appendChild(current);
            current = parent.childNodes.item(to);
          }
        }

        updateBindingTargets(visual, container);
        to++;
      }
    }
  };

  /**
   * Process an instance mutation (completely replace the visuals)
   * - called by the items setter
   */
  private handleInstanceMutation(items: T & { $observer: CollectionObserver }): void {
    items = this.observer.collectionKind & CollectionKind.indexed ? items : <any>Array.from(items);
    this.slot.removeAll(true, true);
    const children = <IVisual[]>this.slot.children;
    let len = (children.length = items[this.observer.lengthPropertyName]);
    let i = 0;
    while (i < len) {
      const visual = children[i] = this.factory.create();
      this.addVisual(visual, items[i]);
      i++;
    }
    this.hasPendingInstanceMutation = false;
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

function updateBindingTargets(visual: IVisual, container: IContainer): void {
  const bindable = visual.$bindable;
  const bindableCount = bindable.length;
  const scope = visual.$scope;
  let i = 0;
  while (i < bindableCount) {
    const binding = bindable[i];
    const value = binding['sourceExpression'].evaluate(scope, container, BindingFlags.none);
    if (value !== binding['target'][binding['targetProperty']]) {
      binding['updateTarget'](value);
    }
    i++;
  }
}
