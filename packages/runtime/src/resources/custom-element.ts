import {
  Constructable,
  DI,
  IContainer,
  IResourceKind,
  ResourceType,
  Registration,
  Protocol,
  Metadata,
  PartialResourceDefinition,
  Key,
  ResourceDefinition,
  mergeArrays,
  fromDefinitionOrDefault,
  pascalCase,
  fromAnnotationOrTypeOrDefault,
  fromAnnotationOrDefinitionOrTypeOrDefault,
  Injectable,
  IResolver,
} from '@aurelia/kernel';
import {
  registerAliases,
  ITargetedInstruction,
  HooksDefinition,
} from '../definitions';
import {
  IDOM,
  INode,
  INodeSequence,
  IRenderLocation,
  DOM
} from '../dom';
import {
  ICustomElementViewModel,
  ICustomElementController,
} from '../lifecycle';
import { BindingStrategy } from '../flags';
import { Bindable, PartialBindableDefinition, BindableDefinition } from '../templating/bindable';
import { PartialChildrenDefinition, ChildrenDefinition, Children } from '../templating/children';
import { IProjections } from './custom-elements/au-slot';
import { Controller } from '../templating/controller';

export type PartialCustomElementDefinition = PartialResourceDefinition<{
  readonly cache?: '*' | number;
  readonly template?: unknown;
  readonly instructions?: readonly (readonly ITargetedInstruction[])[];
  readonly dependencies?: readonly Key[];
  readonly injectable?: InjectableToken | null;
  readonly needsCompile?: boolean;
  readonly surrogates?: readonly ITargetedInstruction[];
  readonly bindables?: Record<string, PartialBindableDefinition> | readonly string[];
  readonly childrenObservers?: Record<string, PartialChildrenDefinition>;
  readonly containerless?: boolean;
  readonly isStrictBinding?: boolean;
  readonly shadowOptions?: { mode: 'open' | 'closed' } | null;
  readonly hasSlots?: boolean;
  readonly strategy?: BindingStrategy;
  readonly hooks?: Readonly<HooksDefinition>;
  readonly enhance?: boolean;
  readonly projectionsMap?: Map<ITargetedInstruction, IProjections>;
}>;

export type CustomElementType<
  C extends Constructable = Constructable,
  T extends INode = INode,
> = ResourceType<C, ICustomElementViewModel<T> & (C extends Constructable<infer P> ? P : {}), PartialCustomElementDefinition>;
export type CustomElementKind = IResourceKind<CustomElementType, CustomElementDefinition> & {
  /**
   * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
   * parent node (including containerless) that is a custom element.
   *
   * As long as the provided node was directly or indirectly created by Aurelia, this method is guaranteed to return a controller.
   *
   * @param node - The node relative to which to get the closest controller.
   * @param searchParents - Also search the parent nodes (including containerless).
   * @returns The closest controller relative to the provided node.
   * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
   */
  for<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(node: T, opts: { searchParents: true }): ICustomElementController<T, C>;
  /**
   * Returns the controller that is associated with this node, if it is a custom element with the provided name.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element with the provided name.
   * @returns The controller associated with the provided node, if it is a custom element with the provided name, or otherwise `undefined`.
   * @throws - If the node does not host a custom element, an error will be thrown.
   */
  for<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(node: T, opts: { name: string }): ICustomElementController<T, C> | undefined;
  /**
   * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
   * parent node (including containerless) that is a custom element with the provided name.
   *
   * @param node - The node relative to which to get the closest controller of a custom element with the provided name.
   * @param searchParents - Also search the parent nodes (including containerless).
   * @returns The closest controller of a custom element with the provided name, relative to the provided node, if one can be found, or otherwise `undefined`.
   * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
   */
  for<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(node: T, opts: { name: string; searchParents: true }): ICustomElementController<T, C> | undefined;
  /**
   * Returns the controller that is associated with this node, if it is a custom element.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element.
   * @param optional - If `true`, do not throw if the provided node is not a custom element.
   * @returns The controller associated with the provided node, if it is a custom element
   * @throws - If the node does not host a custom element, an error will be thrown.
   */
  for<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(node: T): ICustomElementController<T, C>;
  /**
   * Returns the controller that is associated with this node, if it is a custom element.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element.
   * @param optional - If `true`, do not throw if the provided node is not a custom element.
   * @returns The controller associated with the provided node, if it is a custom element, otherwise `null`
   */
  for<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(node: T, opts: { optional: true }): ICustomElementController<T, C> | null;
  isType<T extends INode, C>(value: C): value is (C extends Constructable ? CustomElementType<C, T> : never);
  define<T extends INode, C extends Constructable >(name: string, Type: C): CustomElementType<C, T>;
  define<T extends INode, C extends Constructable >(def: PartialCustomElementDefinition, Type: C): CustomElementType<C, T>;
  define<T extends INode, C extends Constructable >(def: PartialCustomElementDefinition, Type?: null): CustomElementType<C, T>;
  define<T extends INode, C extends Constructable >(nameOrDef: string | PartialCustomElementDefinition, Type: C): CustomElementType<C, T>;
  getDefinition<T extends INode, C extends Constructable>(Type: C): CustomElementDefinition<C, T>;
  annotate<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void;
  getAnnotation<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K): PartialCustomElementDefinition[K];
  generateName(): string;
  createInjectable<T extends Key = Key>(): InjectableToken<T>;
  generateType<P extends {} = {}>(
    name: string,
    proto?: P,
  ): CustomElementType<Constructable<P>>;
};

export type CustomElementDecorator = <T extends Constructable>(Type: T) => CustomElementType<T>;

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(definition: PartialCustomElementDefinition): CustomElementDecorator;
export function customElement(name: string): CustomElementDecorator;
export function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator;
export function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator {
  return function (target) {
    return CustomElement.define(nameOrDef, target);
  };
}

type ShadowOptions = Pick<PartialCustomElementDefinition, 'shadowOptions'>['shadowOptions'];

/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM(options?: ShadowOptions): (target: Constructable) => void;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM(target: Constructable): void;
export function useShadowDOM(targetOrOptions?: Constructable | ShadowOptions): void | ((target: Constructable) => void) {
  if (targetOrOptions === void 0) {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'shadowOptions', { mode: 'open' });
    };
  }

  if (typeof targetOrOptions !== 'function') {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'shadowOptions', targetOrOptions);
    };
  }

  CustomElement.annotate(targetOrOptions, 'shadowOptions', { mode: 'open' });
}

/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(): (target: Constructable) => void;
export function containerless(target?: Constructable): void | ((target: Constructable) => void) {
  if (target === void 0) {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'containerless', true);
    };
  }

  CustomElement.annotate(target, 'containerless', true);
}

/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function strict(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function strict(): (target: Constructable) => void;
export function strict(target?: Constructable): void | ((target: Constructable) => void) {
  if (target === void 0) {
    return function ($target: Constructable) {
      CustomElement.annotate($target, 'isStrictBinding', true);
    };
  }

  CustomElement.annotate(target, 'isStrictBinding', true);
}

const definitionLookup = new WeakMap<PartialCustomElementDefinition, CustomElementDefinition>();

export class CustomElementDefinition<
  C extends Constructable = Constructable,
  T extends INode = INode
> implements ResourceDefinition<C, ICustomElementViewModel<T>, PartialCustomElementDefinition> {
  private constructor(
    public readonly Type: CustomElementType<C, T>,
    public readonly name: string,
    public readonly aliases: string[],
    public readonly key: string,
    public readonly cache: '*' | number,
    public readonly template: unknown,
    public readonly instructions: readonly (readonly ITargetedInstruction[])[],
    public readonly dependencies: readonly Key[],
    public readonly injectable: InjectableToken<C> | null,
    public readonly needsCompile: boolean,
    public readonly surrogates: readonly ITargetedInstruction[],
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly childrenObservers: Record<string, ChildrenDefinition>,
    public readonly containerless: boolean,
    public readonly isStrictBinding: boolean,
    public readonly shadowOptions: { mode: 'open' | 'closed' } | null,
    public readonly hasSlots: boolean,
    public readonly strategy: BindingStrategy,
    public readonly hooks: Readonly<HooksDefinition>,
    public readonly enhance: boolean,
    public readonly projectionsMap: Map<ITargetedInstruction, IProjections>,
  ) {}

  public static create<T extends Constructable = Constructable>(
    def: PartialCustomElementDefinition,
    Type?: null,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    name: string,
    Type: CustomElementType<T>,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomElementDefinition,
    Type?: CustomElementType<T> | null,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomElementDefinition,
    Type: CustomElementType<T> | null = null,
  ): CustomElementDefinition<T> {
    if (Type === null) {
      const def = nameOrDef;
      if (typeof def === 'string') {
        throw new Error(`Cannot create a custom element definition with only a name and no type: ${nameOrDef}`);
      }

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const name = fromDefinitionOrDefault('name', def, CustomElement.generateName);
      if (typeof (def as CustomElementDefinition).Type === 'function') {
        // This needs to be a clone (it will usually be the compiler calling this signature)

        // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
        // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
        Type = (def as CustomElementDefinition).Type as CustomElementType<T>;
      } else {
        Type = CustomElement.generateType(pascalCase(name)) as CustomElementType<T>;
      }

      return new CustomElementDefinition(
        Type,
        name,
        mergeArrays(def.aliases),
        fromDefinitionOrDefault('key', def as CustomElementDefinition, () => CustomElement.keyFrom(name)),
        fromDefinitionOrDefault('cache', def, () => 0),
        fromDefinitionOrDefault('template', def, () => null),
        mergeArrays(def.instructions),
        mergeArrays(def.dependencies),
        fromDefinitionOrDefault('injectable', def, () => null),
        fromDefinitionOrDefault('needsCompile', def, () => true),
        mergeArrays(def.surrogates),
        Bindable.from(def.bindables),
        Children.from(def.childrenObservers),
        fromDefinitionOrDefault('containerless', def, () => false),
        fromDefinitionOrDefault('isStrictBinding', def, () => false),
        fromDefinitionOrDefault('shadowOptions', def, () => null),
        fromDefinitionOrDefault('hasSlots', def, () => false),
        fromDefinitionOrDefault('strategy', def, () => BindingStrategy.getterSetter),
        fromDefinitionOrDefault('hooks', def, () => HooksDefinition.none),
        fromDefinitionOrDefault('enhance', def, () => false),
        fromDefinitionOrDefault('projectionsMap', def as CustomElementDefinition, () => new Map<ITargetedInstruction, IProjections>()),
      );
    }

    // If a type is passed in, we ignore the Type property on the definition if it exists.
    // TODO: document this behavior

    if (typeof nameOrDef === 'string') {
      return new CustomElementDefinition(
        Type,
        nameOrDef,
        mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), Type.aliases),
        CustomElement.keyFrom(nameOrDef),
        fromAnnotationOrTypeOrDefault('cache', Type, () => 0),
        fromAnnotationOrTypeOrDefault('template', Type, () => null),
        mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), Type.instructions),
        mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), Type.dependencies),
        fromAnnotationOrTypeOrDefault('injectable', Type, () => null),
        fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true),
        mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), Type.surrogates),
        Bindable.from(
          ...Bindable.getAll(Type),
          CustomElement.getAnnotation(Type, 'bindables'),
          Type.bindables,
        ),
        Children.from(
          ...Children.getAll(Type),
          CustomElement.getAnnotation(Type, 'childrenObservers'),
          Type.childrenObservers,
        ),
        fromAnnotationOrTypeOrDefault('containerless', Type, () => false),
        fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false),
        fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null),
        fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false),
        fromAnnotationOrTypeOrDefault('strategy', Type, () => BindingStrategy.getterSetter),
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        fromAnnotationOrTypeOrDefault('hooks', Type, () => new HooksDefinition(Type!.prototype)),
        fromAnnotationOrTypeOrDefault('enhance', Type, () => false),
        fromAnnotationOrTypeOrDefault('projectionsMap', Type, () => new Map<ITargetedInstruction, IProjections>()),
      );
    }

    // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
    // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
    // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
    // if this turns out to be too opinionated.

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const name = fromDefinitionOrDefault('name', nameOrDef, CustomElement.generateName);
    return new CustomElementDefinition(
      Type,
      name,
      mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases),
      CustomElement.keyFrom(name),
      fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0),
      fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null),
      mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions),
      mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies),
      fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, () => null),
      fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true),
      mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates),
      Bindable.from(
        ...Bindable.getAll(Type),
        CustomElement.getAnnotation(Type, 'bindables'),
        Type.bindables,
        nameOrDef.bindables,
      ),
      Children.from(
        ...Children.getAll(Type),
        CustomElement.getAnnotation(Type, 'childrenObservers'),
        Type.childrenObservers,
        nameOrDef.childrenObservers,
      ),
      fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false),
      fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false),
      fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null),
      fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false),
      fromAnnotationOrDefinitionOrTypeOrDefault('strategy', nameOrDef, Type, () => BindingStrategy.getterSetter),
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      fromAnnotationOrTypeOrDefault('hooks', Type, () => new HooksDefinition(Type!.prototype)),
      fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, () => false),
      fromAnnotationOrDefinitionOrTypeOrDefault('projectionsMap', nameOrDef, Type, () => new Map<ITargetedInstruction, IProjections>()),
    );
  }

  public static getOrCreate(partialDefinition: PartialCustomElementDefinition): CustomElementDefinition {
    if (partialDefinition instanceof CustomElementDefinition) {
      return partialDefinition;
    }

    if (definitionLookup.has(partialDefinition)) {
      return definitionLookup.get(partialDefinition)!;
    }

    const definition = CustomElementDefinition.create(partialDefinition);
    definitionLookup.set(partialDefinition, definition);
    // Make sure the full definition can be retrieved from dynamically created classes as well
    Metadata.define(CustomElement.name, definition, definition.Type);
    return definition;
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.transient(key, Type).register(container);
    Registration.aliasTo(key, Type).register(container);
    registerAliases(aliases, CustomElement, key, container);
  }
}

export type InjectableToken<K = any> = (target: Injectable<K>, property: string, index: number) => void;
type InternalInjectableToken<K = any> = InjectableToken<K> & {
  register?(container: IContainer): IResolver<K>;
};

type ForOpts = {
  name?: string;
  searchParents?: boolean;
  optional?: boolean;
};
const defaultForOpts: ForOpts = {
  name: undefined,
  searchParents: false,
  optional: false,
};

export const CustomElement: CustomElementKind = {
  name: Protocol.resource.keyFor('custom-element'),
  keyFrom(name: string): string {
    return `${CustomElement.name}:${name}`;
  },
  isType<T extends INode, C>(value: C): value is (C extends Constructable ? CustomElementType<C, T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(CustomElement.name, value);
  },
  for<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(node: T, opts: ForOpts = defaultForOpts): ICustomElementController<T, C> {
    if (opts.name === void 0 && opts.searchParents !== true) {
      const controller = Metadata.getOwn(CustomElement.name, node) as Controller<T, C> | undefined;
      if (controller === void 0) {
        if (opts.optional === true) {
          return null!;
        }
        throw new Error(`The provided node is not a custom element or containerless host.`);
      }
      return controller as unknown as ICustomElementController<T, C>;
    }
    if (opts.name !== void 0) {
      if (opts.searchParents !== true) {
        const controller = Metadata.getOwn(CustomElement.name, node) as Controller<T, C> | undefined;
        if (controller === void 0) {
          throw new Error(`The provided node is not a custom element or containerless host.`);
        }

        if (controller.is(opts.name)) {
          return controller as unknown as ICustomElementController<T, C>;
        }

        return (void 0)!;
      }

      let cur = node as INode | null;
      let foundAController = false;
      while (cur !== null) {
        const controller = Metadata.getOwn(CustomElement.name, cur) as Controller<T, C> | undefined;
        if (controller !== void 0) {
          foundAController = true;
          if (controller.is(opts.name)) {
            return controller as unknown as ICustomElementController<T, C>;
          }
        }

        cur = DOM.getEffectiveParentNode(cur);
      }

      if (foundAController) {
        return (void 0)!;
      }

      throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
    }

    let cur = node as INode | null;
    while (cur !== null) {
      const controller = Metadata.getOwn(CustomElement.name, cur);
      if (controller !== void 0) {
        return controller;
      }

      cur = DOM.getEffectiveParentNode(cur);
    }

    throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
  },
  define<T extends INode, C extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type?: C | null): CustomElementType<C, T> {
    const definition = CustomElementDefinition.create(nameOrDef, Type as Constructable | null);
    Metadata.define(CustomElement.name, definition, definition.Type);
    Metadata.define(CustomElement.name, definition, definition);
    Protocol.resource.appendTo(definition.Type, CustomElement.name);

    return definition.Type as CustomElementType<C, T>;
  },
  getDefinition<T extends INode, C extends Constructable>(Type: C): CustomElementDefinition<C, T> {
    const def = Metadata.getOwn(CustomElement.name, Type) as CustomElementDefinition<C, T>;
    if (def === void 0) {
      throw new Error(`No definition found for type ${Type.name}`);
    }

    return def;
  },
  annotate<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void {
    Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
  },
  getAnnotation<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K): PartialCustomElementDefinition[K] {
    return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
  },
  generateName: (function () {
    let id = 0;

    return function () {
      return `unnamed-${++id}`;
    };
  })(),
  createInjectable<K extends Key = Key>(): InjectableToken<K> {
    const $injectable: InternalInjectableToken<K> = function (target, property, index): any {
      const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
      annotationParamtypes[index] = $injectable;
      return target;
    };

    $injectable.register = function (container) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        resolve(container, requestor) {
          if (requestor.has($injectable, true)) {
            return requestor.get($injectable);
          } else {
            return null;
          }
        },
      } as IResolver;
    };

    return $injectable;
  },
  generateType: (function () {
    const nameDescriptor: PropertyDescriptor = {
      value: '',
      writable: false,
      enumerable: false,
      configurable: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultProto = {} as any;

    return function <P extends {} = {}> (
      name: string,
      proto: P = defaultProto,
    ): CustomElementType<Constructable<P>> {
      // Anonymous class ensures that minification cannot cause unintended side-effects, and keeps the class
      // looking similarly from the outside (when inspected via debugger, etc).
      const Type = class {} as CustomElementType<Constructable<P>>;

      // Define the name property so that Type.name can be used by end users / plugin authors if they really need to,
      // even when minified.
      nameDescriptor.value = name;
      Reflect.defineProperty(Type, 'name', nameDescriptor);

      // Assign anything from the prototype that was passed in
      if (proto !== defaultProto) {
        Object.assign(Type.prototype, proto);
      }

      return Type;
    };
  })(),
};

export type CustomElementHost<T extends INode = INode> = IRenderLocation<T> & T & {
  $controller?: ICustomElementController<T>;
};

export interface IElementProjector<T extends INode = INode> {
  readonly host: CustomElementHost<T>;
  readonly children: ArrayLike<CustomElementHost<T>>;

  provideEncapsulationSource(): T;
  project(nodes: INodeSequence<T>): void;
  take(nodes: INodeSequence<T>): void;

  subscribeToChildrenChange(callback: () => void, options?: any): void;
}

export const IProjectorLocator = DI.createInterface<IProjectorLocator>('IProjectorLocator').noDefault();

export interface IProjectorLocator<T extends INode = INode> {
  getElementProjector(dom: IDOM<T>, $component: ICustomElementController<T>, host: CustomElementHost<T>, def: CustomElementDefinition): IElementProjector<T>;
}
