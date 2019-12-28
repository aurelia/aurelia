/* eslint-disable @typescript-eslint/no-use-before-define */
import { Constructable, Protocol, Metadata, firstDefined, getPrototypeChain, IIndexable, Reporter } from '@aurelia/kernel';
import { INode } from '../dom';
import { ICustomElementViewModel, ICustomElementController } from '../lifecycle';
import { IElementProjector, CustomElement } from '../resources/custom-element';
import { ISubscriberCollection, IAccessor, ISubscribable, IPropertyObserver, ISubscriber } from '../observation';
import { LifecycleFlags } from '../flags';
import { subscriberCollection } from '../observation/subscriber-collection';

export type PartialChildrenDefinition<TNode extends INode = INode> = {
  callback?: string;
  property?: string;
  options?: MutationObserverInit;
  query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>;
  filter?: (node: TNode, controller?: ICustomElementController<TNode>, viewModel?: ICustomElementViewModel<TNode>) => boolean;
  map?: (node: TNode, controller?: ICustomElementController<TNode>, viewModel?: ICustomElementViewModel<TNode>) => any;
};

/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 *
 * @param config - The overrides
 */
export function children(config?: PartialChildrenDefinition): PropertyDecorator;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 *
 * @param prop - The property name
 */
export function children(prop: string): ClassDecorator;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export function children(target: {}, prop: string): void;
export function children(configOrTarget?: PartialChildrenDefinition | {}, prop?: string): void | PropertyDecorator | ClassDecorator {
  let config: PartialChildrenDefinition;

  function decorator($target: {}, $prop: symbol | string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @children
      // Invocation with or w/o opts:
      // - @children()
      // - @children({...opts})
      config.property = $prop as string;
    }

    Metadata.define(Children.name, ChildrenDefinition.create($prop as string, config), $target.constructor, $prop);
    Protocol.annotation.appendTo($target.constructor as Constructable, Children.keyFrom($prop as string));
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @children
    config = {};
    decorator(configOrTarget!, prop!);
    return;
  } else if (typeof configOrTarget === 'string') {
    // ClassDecorator
    // - @children('bar')
    // Direct call:
    // - @children('bar')(Foo)
    config = {};
    return decorator;
  }

  // Invocation with or w/o opts:
  // - @children()
  // - @children({...opts})
  config = configOrTarget === void 0 ? {} : configOrTarget;
  return decorator;
}

function isChildrenObserverAnnotation(key: string): boolean {
  return key.startsWith(Children.name);
}

export const Children = {
  name: Protocol.annotation.keyFor('children-observer'),
  keyFrom(name: string): string {
    return `${Children.name}:${name}`;
  },
  from(...childrenObserverLists: readonly (ChildrenDefinition | Record<string, PartialChildrenDefinition> | readonly string[] | undefined)[]): Record<string, ChildrenDefinition> {
    const childrenObservers: Record<string, ChildrenDefinition> = {};

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const isArray = Array.isArray as <T>(arg: unknown) => arg is readonly T[];

    function addName(name: string): void {
      childrenObservers[name] = ChildrenDefinition.create(name);
    }

    function addDescription(name: string, def: PartialChildrenDefinition): void {
      childrenObservers[name] = ChildrenDefinition.create(name, def);
    }

    function addList(maybeList: ChildrenDefinition | Record<string, PartialChildrenDefinition> | readonly string[] | undefined): void {
      if (isArray(maybeList)) {
        maybeList.forEach(addName);
      } else if (maybeList instanceof ChildrenDefinition) {
        childrenObservers[maybeList.property] = maybeList;
      } else if (maybeList !== void 0) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
      }
    }

    childrenObserverLists.forEach(addList);

    return childrenObservers;
  },
  getAll(Type: Constructable): readonly ChildrenDefinition[] {
    const propStart = Children.name.length + 1;
    const defs: ChildrenDefinition[] = [];
    const prototypeChain = getPrototypeChain(Type);

    let iProto = prototypeChain.length;
    let iDefs = 0;
    let keys: string[];
    let keysLen: number;
    let Class: Constructable;
    while (--iProto >= 0) {
      Class = prototypeChain[iProto];
      keys = Protocol.annotation.getKeys(Class).filter(isChildrenObserverAnnotation);
      keysLen = keys.length;
      for (let i = 0; i < keysLen; ++i) {
        defs[iDefs++] = Metadata.getOwn(Children.name, Class, keys[i].slice(propStart));
      }
    }
    return defs;
  },
};

export class ChildrenDefinition<TNode extends INode = INode> {
  private constructor(
    public readonly callback: string,
    public readonly property: string,
    public readonly options?: MutationObserverInit,
    public readonly query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>,
    public readonly filter?: (node: TNode, controller?: ICustomElementController<TNode>, viewModel?: ICustomElementViewModel<TNode>) => boolean,
    public readonly map?: (node: TNode, controller?: ICustomElementController<TNode>, viewModel?: ICustomElementViewModel<TNode>) => any,
  ) {}

  public static create<TNode extends INode = INode>(prop: string, def: PartialChildrenDefinition<TNode> = {}): ChildrenDefinition<TNode> {
    return new ChildrenDefinition(
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.property, prop),
      def.options,
      def.query,
      def.filter,
      def.map,
    );
  }
}

export interface ChildrenObserver extends
  IAccessor,
  ISubscribable,
  ISubscriberCollection,
  IPropertyObserver<IIndexable, string>{ }

/** @internal */
@subscriberCollection()
export class ChildrenObserver {
  public observing: boolean = false;

  private readonly callback: () => void;
  private children: any[] = (void 0)!;

  public constructor(
    private readonly controller: ICustomElementController,
    public readonly obj: IIndexable,
    flags: LifecycleFlags,
    public readonly propertyKey: string,
    cbName: string,
    private readonly query = defaultChildQuery,
    private readonly filter = defaultChildFilter,
    private readonly map = defaultChildMap,
    private readonly options?: MutationObserverInit
  ) {
    this.callback = obj[cbName] as typeof ChildrenObserver.prototype.callback;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.createGetterSetter();
  }

  public getValue(): any[] {
    this.tryStartObserving();
    return this.children;
  }

  public setValue(newValue: unknown): void { /* do nothing */ }

  public subscribe(subscriber: ISubscriber): void {
    this.tryStartObserving();
    this.addSubscriber(subscriber);
  }

  private tryStartObserving() {
    if (!this.observing) {
      this.observing = true;
      const projector = this.controller.projector!;
      this.children = filterChildren(projector, this.query, this.filter, this.map);
      projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); }, this.options);
    }
  }

  private onChildrenChanged(): void {
    this.children = filterChildren(this.controller.projector!, this.query, this.filter, this.map);

    if (this.callback !== void 0) {
      this.callback.call(this.obj);
    }

    this.callSubscribers(this.children, undefined, this.persistentFlags | LifecycleFlags.updateTargetInstance);
  }

  private createGetterSetter(): void {
    if (
      !Reflect.defineProperty(
        this.obj,
        this.propertyKey,
        {
          enumerable: true,
          configurable: true,
          get: () => this.getValue(),
          set: () => { return; },
        }
      )
    ) {
      Reporter.write(1, this.propertyKey, this.obj);
    }
  }
}

function defaultChildQuery(projector: IElementProjector): ArrayLike<INode> {
  return projector.children;
}

function defaultChildFilter(node: INode, controller?: ICustomElementController, viewModel?: any): boolean {
  return !!viewModel;
}

function defaultChildMap(node: INode, controller?: ICustomElementController, viewModel?: any): any {
  return viewModel;
}

/** @internal */
export function filterChildren(
  projector: IElementProjector,
  query: typeof defaultChildQuery,
  filter: typeof defaultChildFilter,
  map: typeof defaultChildMap
): any[] {
  const nodes = query(projector);
  const children = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const node = nodes[i];
    const controller = CustomElement.for(node);
    const viewModel = controller ? controller.viewModel : null;

    if (filter(node, controller, viewModel)) {
      children.push(map(node, controller, viewModel));
    }
  }

  return children;
}
