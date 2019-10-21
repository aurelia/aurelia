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
  IRenderLocation
} from '../dom';
import {
  IController,
  IViewModel,
} from '../lifecycle';
import { BindingStrategy } from '../flags';
import { Bindable, PartialBindableDefinition, BindableDefinition } from '../templating/bindable';
import { PartialChildrenDefinition, ChildrenDefinition, Children } from '../templating/children';

export type PartialCustomElementDefinition = PartialResourceDefinition<{
  readonly cache?: '*' | number;
  readonly template?: unknown;
  readonly instructions?: readonly (readonly ITargetedInstruction[])[];
  readonly dependencies?: readonly Key[];
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
  readonly scopeParts?: readonly string[];
}>;

export type CustomElementType<T extends Constructable = Constructable> = ResourceType<T, IViewModel & (T extends Constructable<infer P> ? P : {}), PartialCustomElementDefinition>;
export type CustomElementKind = IResourceKind<CustomElementType, CustomElementDefinition> & {
  behaviorFor<T extends INode = INode>(node: T): IController<T> | undefined;
  isType<T>(value: T): value is (T extends Constructable ? CustomElementType<T> : never);
  define<T extends Constructable>(name: string, Type: T): CustomElementType<T>;
  define<T extends Constructable>(def: PartialCustomElementDefinition, Type: T): CustomElementType<T>;
  define<T extends Constructable = Constructable>(def: PartialCustomElementDefinition, Type?: null): CustomElementType<T>;
  define<T extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type: T): CustomElementType<T>;
  getDefinition<T extends Constructable>(Type: T): CustomElementDefinition<T>;
  annotate<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void;
  getAnnotation<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K): PartialCustomElementDefinition[K];
  generateName(): string;
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

export class CustomElementDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, IViewModel, PartialCustomElementDefinition> {
  private constructor(
    public readonly Type: CustomElementType<T>,
    public readonly name: string,
    public readonly aliases: string[],
    public readonly key: string,
    public readonly cache: '*' | number,
    public readonly template: unknown,
    public readonly instructions: readonly (readonly ITargetedInstruction[])[],
    public readonly dependencies: readonly Key[],
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
    public readonly scopeParts: string[],
  ) {}

  public static create<T extends Constructable = Constructable>(
    name: string,
    Type: CustomElementType<T>,
  ): CustomElementDefinition<T>;
  public static create<T extends Constructable = Constructable>(
    def: PartialCustomElementDefinition,
    Type?: null,
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
        mergeArrays(def.scopeParts),
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
        mergeArrays(CustomElement.getAnnotation(Type, 'scopeParts'), Type.scopeParts),
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
      mergeArrays(CustomElement.getAnnotation(Type, 'scopeParts'), nameOrDef.scopeParts, Type.scopeParts),
    );
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    Registration.transient(key, Type).register(container);
    Registration.alias(key, Type).register(container);
    registerAliases(aliases, CustomElement, key, container);
  }
}

export const CustomElement: CustomElementKind = {
  name: Protocol.resource.keyFor('custom-element'),
  keyFrom(name: string): string {
    return `${CustomElement.name}:${name}`;
  },
  isType<T>(value: T): value is (T extends Constructable ? CustomElementType<T> : never) {
    return typeof value === 'function' && Metadata.hasOwn(CustomElement.name, value);
  },
  behaviorFor<T extends INode = INode>(node: T): IController<T> | undefined {
    return (node as CustomElementHost<T>).$controller;
  },
  define<T extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type?: T | null): CustomElementType<T> {
    const definition = CustomElementDefinition.create(nameOrDef, Type as Constructable | null);
    Metadata.define(CustomElement.name, definition, definition.Type);
    Metadata.define(CustomElement.name, definition, definition);
    Protocol.resource.appendTo(definition.Type, CustomElement.name);

    return definition.Type as CustomElementType<T>;
  },
  getDefinition<T extends Constructable>(Type: T): CustomElementDefinition<T> {
    const def = Metadata.getOwn(CustomElement.name, Type) as CustomElementDefinition<T>;
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
  generateType: (function () {
    const nameDescriptor: PropertyDescriptor = {
      value: '',
      writable: false,
      enumerable: false,
      configurable: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultProto = {} as any;

    return function <P extends {} = {}>(
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
  $controller?: IController<T>;
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
  getElementProjector(dom: IDOM<T>, $component: IController<T>, host: CustomElementHost<T>, def: CustomElementDefinition): IElementProjector<T>;
}
