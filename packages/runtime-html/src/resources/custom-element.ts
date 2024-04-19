import {
  mergeArrays,
  fromDefinitionOrDefault,
  pascalCase,
  fromAnnotationOrTypeOrDefault,
  fromAnnotationOrDefinitionOrTypeOrDefault,
  emptyArray,
  resourceBaseName,
  getResourceKeyFor,
} from '@aurelia/kernel';
import { Bindable } from '../bindable';
import { getEffectiveParentNode, getRef } from '../dom';
import { Watch } from '../watch';
import { defineMetadata, getAnnotationKeyFor, getMetadata, hasMetadata } from '../utilities-metadata';
import { def, isFunction, isString, isSymbol, objectAssign, objectFreeze } from '../utilities';
import { aliasRegistration, singletonRegistration } from '../utilities-di';

import type {
  Constructable,
  IContainer,
  ResourceType,
  PartialResourceDefinition,
  Key,
  ResourceDefinition,
  IResolver,
  Writable,
  StaticResourceType,
  InterfaceSymbol,
} from '@aurelia/kernel';
import type { BindableDefinition, PartialBindableDefinition } from '../bindable';
import type { INode } from '../dom';
import type { Controller, ICustomElementViewModel, ICustomElementController } from '../templating/controller';
import type { IPlatform } from '../platform';
import type { IInstruction } from '../renderer';
import type { IWatchDefinition } from '../watch';
import { ErrorNames, createMappedError } from '../errors';
import { dtElement, getDefinitionFromStaticAu, type IResourceKind } from './resources-shared';

export type PartialCustomElementDefinition<TBindables extends string = string> = PartialResourceDefinition<{
  readonly cache?: '*' | number;
  readonly capture?: boolean | ((attr: string) => boolean);
  readonly template?: null | string | Node;
  readonly instructions?: readonly (readonly IInstruction[])[];
  readonly dependencies?: readonly Key[];
  /**
   * An semi internal property used to signal the rendering process not to try to compile the template again
   */
  readonly injectable?: InterfaceSymbol | null;
  readonly needsCompile?: boolean;
  readonly surrogates?: readonly IInstruction[];
  readonly bindables?: Record<TBindables, true | Omit<PartialBindableDefinition, 'name'>> | (TBindables | PartialBindableDefinition & { name: TBindables })[];
  readonly containerless?: boolean;
  readonly shadowOptions?: { mode: 'open' | 'closed' } | null;
  readonly hasSlots?: boolean;
  readonly enhance?: boolean;
  readonly watches?: IWatchDefinition[];
  readonly processContent?: ProcessContentHook | null;
  readonly Type?: Constructable;
}>;

export type CustomElementStaticAuDefinition<TBindables extends string = string> = PartialCustomElementDefinition<TBindables> & {
  type: 'custom-element';
};

export type CustomElementType<C extends Constructable = Constructable> = ResourceType<C, ICustomElementViewModel & (C extends Constructable<infer P> ? P : object), PartialCustomElementDefinition>;
export type CustomElementKind = IResourceKind & {
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
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { searchParents: true }): ICustomElementController<C>;
  /**
   * Returns the controller that is associated with this node, if it is a custom element with the provided name.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element with the provided name.
   * @returns The controller associated with the provided node, if it is a custom element with the provided name, or otherwise `undefined`.
   * @throws - If the node does not host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { name: string }): ICustomElementController<C> | undefined;
  /**
   * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
   * parent node (including containerless) that is a custom element with the provided name.
   *
   * @param node - The node relative to which to get the closest controller of a custom element with the provided name.
   * @param searchParents - Also search the parent nodes (including containerless).
   * @returns The closest controller of a custom element with the provided name, relative to the provided node, if one can be found, or otherwise `undefined`.
   * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { name: string; searchParents: true }): ICustomElementController<C> | undefined;
  /**
   * Returns the controller that is associated with this node, if it is a custom element.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element.
   * @param optional - If `true`, do not throw if the provided node is not a custom element.
   * @returns The controller associated with the provided node, if it is a custom element
   * @throws - If the node does not host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node): ICustomElementController<C>;
  /**
   * Returns the controller that is associated with this node, if it is a custom element.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element.
   * @param optional - If `true`, do not throw if the provided node is not a custom element.
   * @returns The controller associated with the provided node, if it is a custom element, otherwise `null`
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { optional: true }): ICustomElementController<C> | null;
  isType<C>(value: C, context?: DecoratorContext): value is (C extends Constructable ? CustomElementType<C> : never);
  define<C extends Constructable>(name: string, Type: C): CustomElementType<C>;
  define<C extends Constructable>(def: PartialCustomElementDefinition, Type: C): CustomElementType<C>;
  define<C extends Constructable>(def: PartialCustomElementDefinition, Type?: null): CustomElementType<C>;
  define<C extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type: C): CustomElementType<C>;
  getDefinition<C extends Constructable>(Type: C, context?: DecoratorContext | null): CustomElementDefinition<C>;
  // eslint-disable-next-line
  getDefinition<C extends Constructable>(Type: Function, context?: DecoratorContext | null): CustomElementDefinition<C>;
  annotate<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K], context: DecoratorContext): void;
  getAnnotation<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, context: DecoratorContext | null): PartialCustomElementDefinition[K] | undefined;
  generateName(): string;
  createInjectable<T extends Key = Key>(): InterfaceSymbol<T>;
  generateType<P extends {} = {}>(
    name: string,
    proto?: P,
  ): CustomElementType<Constructable<P>>;
  find(container: IContainer, name: string): CustomElementDefinition | null;
};

export type CustomElementDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => CustomElementType<T>;

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(definition: PartialCustomElementDefinition): CustomElementDecorator;
export function customElement(name: string): CustomElementDecorator;
export function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator;
export function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator {
  return function <T extends Constructable>(target: T, context: ClassDecoratorContext) {
    context.addInitializer(function (this) {
      defineElement(nameOrDef, this as Constructable);
    });
    return target as CustomElementType<T>;
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
export function useShadowDOM(targetOrOptions?: Constructable | ShadowOptions, context?: ClassDecoratorContext): void | ((target: Constructable, context: ClassDecoratorContext) => void) {
  if (targetOrOptions === void 0) {
    return function ($target: Constructable, context: ClassDecoratorContext) {
      context.addInitializer(function (this) {
        annotateElementMetadata(this as Constructable, 'shadowOptions', { mode: 'open' });
      });
    };
  }

  if (!isFunction(targetOrOptions)) {
    return function ($target: Constructable, context: ClassDecoratorContext) {
      context.addInitializer(function (this) {
        annotateElementMetadata(this as Constructable, 'shadowOptions', targetOrOptions);
      });
    };
  }

  context!.addInitializer(function (this) {
    annotateElementMetadata(this as Constructable, 'shadowOptions', { mode: 'open' });
  });
}

/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(target: Constructable, context: ClassDecoratorContext): void;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(): (target: Constructable, context: ClassDecoratorContext) => void;
export function containerless(target?: Constructable, context?: ClassDecoratorContext): void | ((target: Constructable, context: ClassDecoratorContext) => void) {
  if (target === void 0) {
    return function ($target: Constructable, $context: ClassDecoratorContext) {
      $context.addInitializer(function (this) {
        markContainerless($target);
      });
    };
  }

  context!.addInitializer(function (this) {
    markContainerless(target);
  });
}

/** Manipulates the `containerless` property of the custom element definition for the type, when present else it annotates the type. */
function markContainerless(target: Constructable) {
  const def = getMetadata<CustomElementDefinition>(elementBaseName, target);
  if(def === void 0) {
    annotateElementMetadata(target, 'containerless', true);
    return;
  }
  (def as Writable<CustomElementDefinition>).containerless = true;
}

const definitionLookup = new WeakMap<PartialCustomElementDefinition, CustomElementDefinition>();

export class CustomElementDefinition<C extends Constructable = Constructable> implements ResourceDefinition<C, ICustomElementViewModel, PartialCustomElementDefinition> {
  public get kind(): 'element' { return dtElement; }
  private constructor(
    public readonly Type: CustomElementType<C>,
    public readonly name: string,
    public readonly aliases: string[],
    public readonly key: string,
    public readonly cache: '*' | number,
    public readonly capture: boolean | ((attr: string) => boolean),
    public readonly template: null | string | Node,
    public readonly instructions: readonly (readonly IInstruction[])[],
    public readonly dependencies: readonly Key[],
    public readonly injectable: InterfaceSymbol<C> | null,
    public readonly needsCompile: boolean,
    public readonly surrogates: readonly IInstruction[],
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly containerless: boolean,
    public readonly shadowOptions: { mode: 'open' | 'closed' } | null,
    /**
     * Indicates whether the custom element has <slot/> in its template
     */
    public readonly hasSlots: boolean,
    public readonly enhance: boolean,
    public readonly watches: IWatchDefinition[],
    public readonly processContent: ProcessContentHook | null,
  ) { }

  public static create(
    def: PartialCustomElementDefinition,
    Type?: null,
  ): CustomElementDefinition;
  public static create(
    name: string,
    Type: CustomElementType,
  ): CustomElementDefinition;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomElementDefinition,
    Type?: CustomElementType<T> | null,
  ): CustomElementDefinition<T>;
  public static create(
    nameOrDef: string | PartialCustomElementDefinition,
    Type: CustomElementType | null = null,
  ): CustomElementDefinition {
    // TODO(Sayan): aggregate the info from decorator metadata instead of using the Reflect API
    if (Type === null) {
      const def = nameOrDef;
      if (isString(def)) {
        throw createMappedError(ErrorNames.element_only_name, nameOrDef);
      }

      const name = fromDefinitionOrDefault('name', def, generateElementName);
      if (isFunction((def as CustomElementDefinition).Type)) {
        // This needs to be a clone (it will usually be the compiler calling this signature)

        // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
        // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
        Type = (def as CustomElementDefinition).Type;
      } else {
        Type = generateElementType(pascalCase(name));
      }

      return new CustomElementDefinition(
        Type,
        name,
        mergeArrays(def.aliases),
        fromDefinitionOrDefault('key', def as CustomElementDefinition, () => getElementKeyFrom(name)),
        fromDefinitionOrDefault('cache', def, returnZero),
        fromAnnotationOrDefinitionOrTypeOrDefault('capture', def, Type, returnFalse),
        fromDefinitionOrDefault('template', def, returnNull),
        mergeArrays(def.instructions),
        mergeArrays(getElementAnnotation(Type, 'dependencies'), def.dependencies),
        fromDefinitionOrDefault('injectable', def, returnNull),
        fromDefinitionOrDefault('needsCompile', def, returnTrue),
        mergeArrays(def.surrogates),
        Bindable.from(getElementAnnotation(Type, 'bindables'), def.bindables),
        fromAnnotationOrDefinitionOrTypeOrDefault('containerless', def, Type, returnFalse),
        fromDefinitionOrDefault('shadowOptions', def, returnNull),
        fromDefinitionOrDefault('hasSlots', def, returnFalse),
        fromDefinitionOrDefault('enhance', def, returnFalse),
        fromDefinitionOrDefault('watches', def as CustomElementDefinition, returnEmptyArray),
        fromAnnotationOrTypeOrDefault('processContent', Type, returnNull as () => ProcessContentHook | null),
      );
    }

    // If a type is passed in, we ignore the Type property on the definition if it exists.
    // TODO: document this behavior

    if (isString(nameOrDef)) {
      return new CustomElementDefinition(
        Type,
        nameOrDef,
        mergeArrays(getElementAnnotation(Type, 'aliases'), Type.aliases),
        getElementKeyFrom(nameOrDef),
        fromAnnotationOrTypeOrDefault('cache', Type, returnZero),
        fromAnnotationOrTypeOrDefault('capture', Type, returnFalse),
        fromAnnotationOrTypeOrDefault('template', Type, returnNull as () => string | Node | null),
        mergeArrays(getElementAnnotation(Type, 'instructions'), Type.instructions),
        mergeArrays(getElementAnnotation(Type, 'dependencies'), Type.dependencies),
        fromAnnotationOrTypeOrDefault('injectable', Type, returnNull as () => InterfaceSymbol | null),
        fromAnnotationOrTypeOrDefault('needsCompile', Type, returnTrue),
        mergeArrays(getElementAnnotation(Type, 'surrogates'), Type.surrogates),
        Bindable.from(
          ...Bindable.getAll(Type),
          getElementAnnotation(Type, 'bindables'),
          Type.bindables,
        ),
        fromAnnotationOrTypeOrDefault('containerless', Type, returnFalse),
        fromAnnotationOrTypeOrDefault('shadowOptions', Type, returnNull as () => { mode: 'open' | 'closed' } | null),
        fromAnnotationOrTypeOrDefault('hasSlots', Type, returnFalse),
        fromAnnotationOrTypeOrDefault('enhance', Type, returnFalse),
        mergeArrays(Watch.getDefinitions(Type), Type.watches),
        fromAnnotationOrTypeOrDefault('processContent', Type, returnNull as () => ProcessContentHook | null),
      );
    }

    // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
    // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
    // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
    // if this turns out to be too opinionated.

    const name = fromDefinitionOrDefault('name', nameOrDef, generateElementName);
    return new CustomElementDefinition(
      Type,
      name,
      mergeArrays(getElementAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases),
      getElementKeyFrom(name),
      fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, returnZero),
      fromAnnotationOrDefinitionOrTypeOrDefault('capture', nameOrDef, Type, returnFalse),
      fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, returnNull),
      mergeArrays(getElementAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions),
      mergeArrays(getElementAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies),
      fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, returnNull),
      fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, returnTrue),
      mergeArrays(getElementAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates),
      Bindable.from(
        ...Bindable.getAll(Type),
        getElementAnnotation(Type, 'bindables'),
        Type.bindables,
        nameOrDef.bindables,
      ),
      fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, returnFalse),
      fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, returnNull),
      fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, returnFalse),
      fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, returnFalse),
      mergeArrays(nameOrDef.watches, Watch.getDefinitions(Type), Type.watches),
      fromAnnotationOrDefinitionOrTypeOrDefault('processContent', nameOrDef, Type, returnNull),
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
    defineMetadata(definition, definition.Type, elementBaseName);
    return definition;
  }

  public register(container: IContainer, aliasName?: string | undefined): void {
    const $Type = this.Type;
    const key = typeof aliasName === 'string' ? getElementKeyFrom(aliasName) : this.key;
    const aliases = this.aliases;

    // todo: warn if alreay has key
    if (!container.has(key, false)) {
      container.register(
        container.has($Type, false) ? null : singletonRegistration($Type, $Type),
        aliasRegistration($Type, key),
        ...aliases.map(alias => aliasRegistration($Type, getElementKeyFrom(alias)))
      );
    } /* istanbul ignore next */ else if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[DEV:aurelia] ${createMappedError(ErrorNames.element_existed, this.name)}`);
    }
  }

  public toString() {
    return `au:ce:${this.name}`;
  }
}

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
const returnZero = () => 0;
const returnNull = <T>(): T | null => null;
const returnFalse = () => false;
const returnTrue = () => true;
const returnEmptyArray = () => emptyArray;

/** @internal */ export const elementTypeName = 'custom-element';
/** @internal */ export const elementBaseName = /*@__PURE__*/getResourceKeyFor(elementTypeName);

/** @internal */
export const getElementKeyFrom = (name: string): string => `${elementBaseName}:${name}`;

/** @internal */
export const generateElementName = /*@__PURE__*/(id => () => `unnamed-${++id}`)(0);

const annotateElementMetadata = <K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void => {
  defineMetadata(value, Type, getAnnotationKeyFor(prop));
};

/** @internal */
export const defineElement = <C extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type: C | null): CustomElementType<C> => {
  const definition = CustomElementDefinition.create(nameOrDef, Type as Constructable);
  const $Type = definition.Type as CustomElementType<C>;

  // this is the case, where the APi is invoked directly without a decorator
  // registration of resource name is a requirement for the resource system in kernel (module-loader)
  defineMetadata(definition, $Type, elementBaseName, resourceBaseName);

  return $Type;
};

/** @internal */
export const isElementType = <C>(value: C): value is (C extends Constructable ? CustomElementType<C> : never) => {
  return isFunction(value)
    && (hasMetadata(elementBaseName, value)
      || (value as StaticResourceType).$au?.type === elementTypeName
    );
};

/** @internal */
export const findElementControllerFor = <C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: ForOpts = defaultForOpts): ICustomElementController<C> => {
  if (opts.name === void 0 && opts.searchParents !== true) {
    const controller = getRef(node, elementBaseName) as Controller<C> | null;
    if (controller === null) {
      if (opts.optional === true) {
        return null!;
      }
      throw createMappedError(ErrorNames.node_is_not_a_host, node);
    }
    return controller as unknown as ICustomElementController<C>;
  }
  if (opts.name !== void 0) {
    if (opts.searchParents !== true) {
      const controller = getRef(node, elementBaseName) as Controller<C> | null;
      if (controller === null) {
        throw createMappedError(ErrorNames.node_is_not_a_host2, node);
      }

      if (controller.is(opts.name)) {
        return controller as unknown as ICustomElementController<C>;
      }

      return (void 0)!;
    }

    let cur = node as INode | null;
    let foundAController = false;
    while (cur !== null) {
      const controller = getRef(cur, elementBaseName) as Controller<C> | null;
      if (controller !== null) {
        foundAController = true;
        if (controller.is(opts.name)) {
          return controller as unknown as ICustomElementController<C>;
        }
      }

      cur = getEffectiveParentNode(cur);
    }

    if (foundAController) {
      return (void 0)!;
    }

    throw createMappedError(ErrorNames.node_is_not_part_of_aurelia_app, node);
  }

  let cur = node as INode | null;
  while (cur !== null) {
    const controller = getRef(cur, elementBaseName) as Controller<C> | null;
    if (controller !== null) {
      return controller as unknown as ICustomElementController<C>;
    }

    cur = getEffectiveParentNode(cur);
  }

  throw createMappedError(ErrorNames.node_is_not_part_of_aurelia_app2, node);
};

const getElementAnnotation = <K extends keyof PartialCustomElementDefinition>(
  Type: Constructable,
  prop: K,
): PartialCustomElementDefinition[K] | undefined => getMetadata(getAnnotationKeyFor(prop), Type);

/** @internal */
// eslint-disable-next-line @typescript-eslint/ban-types
export const getElementDefinition = <C extends Constructable>(Type: C | Function): CustomElementDefinition<C> => {
  const def: CustomElementDefinition<C> = getMetadata<CustomElementDefinition<C>>(elementBaseName, Type)
    ?? getDefinitionFromStaticAu<CustomElementDefinition<C>>(Type as CustomElementType, elementTypeName, CustomElementDefinition.create);
  if (def == null) {
    throw createMappedError(ErrorNames.element_def_not_found, Type);
  }

  return def;
};

/** @internal */
export const createElementInjectable = <K extends Key = Key>(): InterfaceSymbol<K> => {
  const $injectable = {
    // Old code is kept around. Needs to be refactored when TC39 supports argument decorator.
    // function(target: Injectable | AbstractInjectable, property: string | symbol | undefined, index?: number): Injectable | AbstractInjectable {
    //   const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target as Constructable);
    //   annotationParamtypes[index!] = $injectable;
    //   return target;
    // },
    $isInterface: false,
    register(): IResolver {
      return {
        $isResolver: true,
        resolve(container, requestor) {
          if (requestor.has($injectable, true)) {
            return requestor.get($injectable);
          } else {
            return null;
          }
        }
      };
    }
  };

  return $injectable;
};

/** @internal */
export const generateElementType = /*@__PURE__*/(function () {
  const nameDescriptor: PropertyDescriptor = {
    value: '',
    writable: false,
    enumerable: false,
    configurable: true,
  };

  const defaultProto = {};

  return function <P extends {} = {}>(
    name: string,
    proto: P = defaultProto as P,
  ): CustomElementType<Constructable<P>> {
    // Anonymous class ensures that minification cannot cause unintended side-effects, and keeps the class
    // looking similarly from the outside (when inspected via debugger, etc).
    const Type = class Anonymous { } as CustomElementType<Constructable<P>>;

    // Define the name property so that Type.name can be used by end users / plugin authors if they really need to,
    // even when minified.
    nameDescriptor.value = name;
    def(Type, 'name', nameDescriptor);

    // Assign anything from the prototype that was passed in
    if (proto !== defaultProto) {
      objectAssign(Type.prototype, proto);
    }

    return Type;
  };
})();

export const CustomElement = objectFreeze<CustomElementKind>({
  name: elementBaseName,
  keyFrom: getElementKeyFrom,
  isType: isElementType,
  for: findElementControllerFor,
  define: defineElement,
  getDefinition: getElementDefinition,
  annotate: annotateElementMetadata,
  getAnnotation: getElementAnnotation,
  generateName: generateElementName,
  createInjectable: createElementInjectable,
  generateType: generateElementType,
  find(c, name) {
    const Type = c.find<CustomElementType>(elementTypeName, name);
    return Type == null
      ? null
      : getMetadata(elementBaseName, Type) ?? getDefinitionFromStaticAu(Type, elementTypeName, CustomElementDefinition.create) ?? null;
  }
});

// eslint-disable-next-line @typescript-eslint/ban-types
type DecoratorFactoryMethod = (target: Function, context: ClassMethodDecoratorContext) => void;
export type ProcessContentHook = (node: HTMLElement, platform: IPlatform, data: Record<PropertyKey, unknown>) => boolean | void;

const pcHookMetadataProperty = /*@__PURE__*/getAnnotationKeyFor('processContent');
export function processContent(hook: ProcessContentHook | string | symbol): CustomElementDecorator;
export function processContent(): DecoratorFactoryMethod;
export function processContent<TClass extends Constructable>(hook?: ProcessContentHook | string | symbol): CustomElementDecorator | DecoratorFactoryMethod {
  return hook === void 0
    // eslint-disable-next-line @typescript-eslint/ban-types
    ? function (target: Function, context: ClassMethodDecoratorContext) {
        if (!context.static || context.kind !== 'method') throw createMappedError(ErrorNames.invalid_process_content_hook, target);
        // As the method is ensured to be static, the following initializer will be invoked in static fashion, before executing the initializers added via a class decorator.
        // Refer: https://tinyurl.com/ts-static-method-deco
        context.addInitializer(function (this) {
          defineMetadata(target, this, pcHookMetadataProperty);
        });
    }
    : function (target: TClass, context: ClassDecoratorContext<TClass>) {
        context.addInitializer(function (this) {
          if (isString(hook) || isSymbol(hook)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
            hook = (this as any)[hook] as ProcessContentHook;
          }
          if (!isFunction(hook)) throw createMappedError(ErrorNames.invalid_process_content_hook, hook);

          const def = getMetadata<CustomElementDefinition>(elementBaseName, this);
          if (def !== void 0) {
            (def as Writable<CustomElementDefinition>).processContent = hook;
          } else {
            defineMetadata(hook, this, pcHookMetadataProperty);
          }
        });
        return target as CustomElementType<TClass>;
    } as CustomElementDecorator;
}

/**
 * Decorator: Indicates that the custom element should capture all attributes and bindings that are not template controllers or bindables
 */
export function capture(filter: (attr: string) => boolean): (target: Constructable, context: ClassDecoratorContext) => void;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function capture(): (target: Constructable, context: ClassDecoratorContext) => void ;
export function capture(targetOrFilter?: (attr: string) => boolean): ((target: Constructable, context: ClassDecoratorContext) => void) {
  return function ($target: Constructable, context: ClassDecoratorContext) {
    const value = isFunction(targetOrFilter) ? targetOrFilter : true;
    context.addInitializer(function (this) {
      annotateElementMetadata(this as Constructable, 'capture', value);

      // also do this to make order of the decorator irrelevant
      if (isElementType(this)) {
        (getElementDefinition(this) as Writable<CustomElementDefinition>).capture = value;
      }
    });
  };
}
