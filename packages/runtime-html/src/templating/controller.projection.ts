import { emptyArray, type IContainer, type IIndexable, type IServiceLocator, type Key } from '@aurelia/kernel';
import { subscriberCollection, type ISubscribable, type ISubscriberCollection } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from '../errors';
import { PartialCustomElementDefinition } from '../resources/custom-element';
import { def, objectAssign, safeString } from '../utilities';
import { createInterface, instanceRegistration } from '../utilities-di';
import { isElement } from '../utilities-dom';
import { type ICustomElementController, type ICustomElementViewModel } from './controller';
import { ILifecycleHooks, lifecycleHooks } from './lifecycle-hooks';

import { getAnnotationKeyFor } from '../utilities-metadata';

/** @internal */
export const defaultSlotName = 'default';
/** @internal */
export const auslotAttr = 'au-slot';

export type PartialSlottedDefinition = {
  callback?: PropertyKey;
  slotName?: string;
  query?: string;
  // options?: MutationObserverInit;
  // query?: (controller: ICustomElementController) => ArrayLike<Node>;
  // filter?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => boolean;
  // map?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => unknown;
};

export type IAuSlotProjections = Record<string, PartialCustomElementDefinition>;

export interface IAuSlotsInfo {
  /**
   * Name of the slots to which content are projected.
   */
  readonly projectedSlots: readonly string[];
}
/**
 * Describing the projection information statically available for a custom element
 */
export const IAuSlotsInfo = /*@__PURE__*/createInterface<IAuSlotsInfo>('IAuSlotsInfo');
export class AuSlotsInfo implements IAuSlotsInfo {
  public constructor(
    public readonly projectedSlots: string[],
  ) { }
}

/**
 * Describe the interface of a slot
 */
export interface IAuSlot {
  readonly name: string;
  readonly nodes: readonly Node[];
  /** Add subscriber to the change listener list of this slot */
  subscribe(subscriber: IAuSlotSubscriber): void;
  /** Remove subscriber from the change listener list of this slot */
  unsubscribe(subscriber: IAuSlotSubscriber): void;
}

export interface IAuSlotSubscriber {
  handleSlotChange(slot: IAuSlot, nodes: Node[]): void;
}

/**
 * Describes the interface of a <au-slot> watcher
 */
export interface IAuSlotWatcher extends ISubscribable {
  // this may be an issue in the future where there's a desire
  // for a watcher to selectively watch multiple slot at once
  // at the moment, it's all (*) or one (name)
  readonly slotName: string;
  watch(slot: IAuSlot): void;
  unwatch(slot: IAuSlot): void;
}
export const IAuSlotWatcher = /*@__PURE__*/createInterface<IAuSlotWatcher>('IAuSlotWatcher');

// 1. on hydrating, create a slot watcher (binding) & register with hydration context
// 2. on slot with projection created, optionally retrieve the slot watcher
//  2.a if there's NOT a watcher, do nothing
//  2.b else register the slot

// 1. au-slot should start listening to mutation when attaching
// 2. au-slot should stop listening to mutation when detaching
// 3. au-slot should notify slot watcher on mutation

interface AuSlotWatcherBinding extends ISubscriberCollection {}
class AuSlotWatcherBinding implements IAuSlotWatcher, IAuSlotSubscriber, ISubscriberCollection {
  /** @internal */
  private readonly _obj: ICustomElementViewModel;
  /** @internal */
  private readonly _callback: (nodes: readonly Node[]) => void;

  public readonly slotName: string;
  /** @internal */
  private readonly _query: string;
  /** @internal */
  private readonly _slots = new Set<IAuSlot>();

  /** @internal */
  private _nodes: Node[] = emptyArray;

  public isBound: boolean = false;

  public constructor(
    obj: ICustomElementViewModel,
    callback: PropertyKey,
    slotName: string,
    query: string,
  ) {
    this._callback = (this._obj = obj as IIndexable)[callback] as typeof AuSlotWatcherBinding.prototype._callback;
    this.slotName = slotName;
    this._query = query;
  }

  public bind() {
    this.isBound = true;
  }

  public unbind(): void {
    this.isBound = false;
  }

  public getValue() {
    return this._nodes;
  }

  public watch(slot: IAuSlot): void {
    if (!this._slots.has(slot)) {
      this._slots.add(slot);
      slot.subscribe(this);
    }
  }

  public unwatch(slot: IAuSlot): void {
    if (this._slots.delete(slot)) {
      slot.unsubscribe(this);
    }
  }

  public handleSlotChange(slot: IAuSlot, nodes: Node[]): void {
    if (!this.isBound) {
      return;
    }
    const oldNodes = this._nodes;
    const $nodes: Node[] = [];
    let $slot: IAuSlot;
    let node: Node;
    for ($slot of this._slots) {
      for (node of $slot === slot ? nodes : $slot.nodes) {
        if (this._query === '*' || (isElement(node) && node.matches(this._query))) {
          $nodes[$nodes.length] = node;
        }
      }
    }
    if ($nodes.length !== oldNodes.length || $nodes.some((n, i) => n !== oldNodes[i])) {
      this._nodes = $nodes;
      this._callback?.call(this._obj, $nodes);
      this.subs.notify($nodes, oldNodes);
    }
  }

  /* istanbul ignore next */
  public get(): ReturnType<IServiceLocator['get']> {
    throw createMappedError(ErrorNames.method_not_implemented, 'get');
  }
}

type SlottedPropDefinition = PartialSlottedDefinition & { name: PropertyKey };
class SlottedLifecycleHooks {
  public constructor(
    private readonly _def: SlottedPropDefinition,
  ) {}

  public register(c: IContainer) {
    instanceRegistration(ILifecycleHooks, this).register(c);
  }

  public hydrating(vm: object, controller: ICustomElementController) {
    const $def = this._def;
    const watcher = new AuSlotWatcherBinding(
      vm,
      $def.callback ?? `${safeString($def.name)}Changed`,
      $def.slotName ?? 'default',
      $def.query ?? '*'
    );
    def(vm, $def.name, {
      enumerable: true,
      configurable: true,
      get: objectAssign((/* SlotWatcherBinding */) => watcher.getValue(), { getObserver: () => watcher }),
      set: (/* SlotWatcherBinding */) => {/* nothing */}
    });

    instanceRegistration(IAuSlotWatcher, watcher).register(controller.container);
    controller.addBinding(watcher);
  }
}

type Tc39PropertyDecorator = (target: undefined, context: ClassFieldDecoratorContext) => (initialValue: unknown) => unknown;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 */
export function slotted(): Tc39PropertyDecorator;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 *
 * @param query - the query select used to match each slotted node of the corresponding <au-slot>
 * If * is provided, then it'll get all nodes (including text nodes)
 */
export function slotted(query: string): Tc39PropertyDecorator;
/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 *
 * @param query - the query select used to match each slotted node of the corresponding <au-slot>
 * If * is provided, then it'll get all nodes (including text nodes)
 * @param slotName - the name of the <au-slot> this slotted decorator is targeting.
 * If * is provided, then it'll get all nodes from all <au-slot>
 */
export function slotted(query: string, slotName: string): Tc39PropertyDecorator;

/**
 * Decorate a property of a class to get updates from the projection of the decorated custom element
 *
 * @param def - The configuration of the slotted decorator.
 */
export function slotted(def: PartialSlottedDefinition): Tc39PropertyDecorator;
export function slotted(queryOrDef?: string | PartialSlottedDefinition, slotName?: string): Tc39PropertyDecorator;
export function slotted(queryOrDef?: string | PartialSlottedDefinition, slotName?: string) {
  if (!mixed) {
    mixed = true;
    subscriberCollection(AuSlotWatcherBinding, null!);
    lifecycleHooks()(SlottedLifecycleHooks, null!);
  }
  const dependenciesKey = getAnnotationKeyFor('dependencies');

  // function decorator($target: {}, $prop: symbol | string, desc?: PropertyDecorator): void {
  function decorator(_: undefined, context: ClassFieldDecoratorContext): void {
    if (context.kind !== 'field') throw createMappedError(ErrorNames.slotted_decorator_invalid_usage);

    const config = (typeof queryOrDef === 'object'
      ? queryOrDef
      : {
        query: queryOrDef,
        slotName,
        name: ''
      }) as SlottedPropDefinition;
    config.name = context.name;

    const dependencies = (context.metadata[dependenciesKey] ??= []) as Key[];
    dependencies.push(new SlottedLifecycleHooks(config));
  }

  return decorator;
}

/* eslint-disable */
function testDecorator() {
  class Abc {
    @slotted() abc: any;
    @slotted('div') a2: any;
    @slotted('div', 'slot1') a3: any;
    @slotted({
      slotName: 'slot1'
    })
    a4: any;
  }
}

let mixed = false;
