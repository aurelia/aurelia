import {
  Class,
  Constructable,
  IContainer,
  IResourceKind,
  IResourceType,
  Omit,
  PLATFORM,
  Registration,
  ResourceDescription,
  Writable
} from '@aurelia/kernel';
import {
  customAttributeKey,
  customAttributeName,
  HooksDefinition,
  IAttributeDefinition
} from '../definitions';
import {
  BindingMode,
  ensureValidStrategy,
} from '../flags';
import {
  IViewModel,
} from '../lifecycle';
import { Bindable } from '../templating/bindable';

type CustomAttributeStaticProperties = Pick<Required<IAttributeDefinition>, 'bindables'>;

export type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;

export interface ICustomAttributeType<C extends Constructable = Constructable> extends
  IResourceType<IAttributeDefinition, InstanceType<C> & IViewModel>,
  CustomAttributeStaticProperties { }

export interface ICustomAttributeResource extends
  IResourceKind<IAttributeDefinition, IViewModel, Class<IViewModel> & CustomAttributeStaticProperties> {
}

/** @internal */
export function registerAttribute(this: ICustomAttributeType, container: IContainer): void {
  const description = this.description;
  const resourceKey = this.kind.keyFrom(description.name);
  const aliases = description.aliases;

  container.register(Registration.transient(resourceKey, this));
  container.register(Registration.transient(this, this));

  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    const aliasKey = this.kind.keyFrom(aliases[i]);
    container.register(Registration.alias(resourceKey, aliasKey));
  }
}

/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export function customAttribute(definition: IAttributeDefinition): CustomAttributeDecorator;
export function customAttribute(name: string): CustomAttributeDecorator;
export function customAttribute(nameOrDefinition: string | IAttributeDefinition): CustomAttributeDecorator;
export function customAttribute(nameOrDefinition: string | IAttributeDefinition): CustomAttributeDecorator {
  return target => CustomAttributeResource.define(nameOrDefinition, target) as any; // TODO: fix this at some point
}

/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export function templateController(definition: IAttributeDefinition): CustomAttributeDecorator;
export function templateController(name: string): CustomAttributeDecorator;
export function templateController(nameOrDefinition: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export function templateController(nameOrDefinition: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator {
  return target => CustomAttributeResource.define(
    typeof nameOrDefinition === 'string'
    ? { isTemplateController: true , name: nameOrDefinition }
    : { isTemplateController: true, ...nameOrDefinition },
    target) as any; // TODO: fix this at some point
}

type HasDynamicOptions = Pick<IAttributeDefinition, 'hasDynamicOptions'>;

function dynamicOptionsDecorator<T extends Constructable>(target: T & HasDynamicOptions): T & Required<HasDynamicOptions> {
  target.hasDynamicOptions = true;
  return target as T & Required<HasDynamicOptions>;
}

/**
 * Decorator: Indicates that the custom attributes has dynamic options.
 */
export function dynamicOptions(): typeof dynamicOptionsDecorator;
/**
 * Decorator: Indicates that the custom attributes has dynamic options.
 */
export function dynamicOptions<T extends Constructable>(target: T & HasDynamicOptions): T & Required<HasDynamicOptions>;
export function dynamicOptions<T extends Constructable>(target?: T & HasDynamicOptions): T & Required<HasDynamicOptions> | typeof dynamicOptionsDecorator {
  return target === undefined ? dynamicOptionsDecorator : dynamicOptionsDecorator<T>(target);
}

function isType<T>(this: ICustomAttributeResource, Type: T & Partial<ICustomAttributeType>): Type is T & ICustomAttributeType {
  return Type.kind === this;
}

function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, definition: IAttributeDefinition, ctor: T): T & ICustomAttributeType<T>;
function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, name: string, ctor: T): T & ICustomAttributeType<T>;
function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, nameOrDefinition: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType<T>;
function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, nameOrDefinition: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType<T> {
  const Type = ctor as T & ICustomAttributeType<T>;
  const WritableType = Type as T & Writable<ICustomAttributeType<T>>;
  const description = createCustomAttributeDescription(typeof nameOrDefinition === 'string' ? { name: nameOrDefinition } : nameOrDefinition, Type);

  WritableType.kind = CustomAttributeResource;
  WritableType.description = description;
  Type.register = registerAttribute;

  return Type;
}

export const CustomAttributeResource: ICustomAttributeResource = {
  name: customAttributeName,
  keyFrom: customAttributeKey,
  isType,
  define
};

/** @internal */
export function createCustomAttributeDescription(def: IAttributeDefinition, Type: ICustomAttributeType): ResourceDescription<IAttributeDefinition> {
  const aliases = def.aliases;
  const defaultBindingMode = def.defaultBindingMode;
  return {
    name: def.name,
    aliases: aliases == null ? PLATFORM.emptyArray as typeof PLATFORM['emptyArray'] & any[] : aliases,
    defaultBindingMode: defaultBindingMode == null ? BindingMode.toView : defaultBindingMode,
    hasDynamicOptions: def.hasDynamicOptions === undefined ? false : def.hasDynamicOptions,
    isTemplateController: def.isTemplateController === undefined ? false : def.isTemplateController,
    bindables: { ...Bindable.for(Type as unknown as {}).get(), ...Bindable.for(def).get() },
    strategy: ensureValidStrategy(def.strategy),
    hooks: new HooksDefinition(Type.prototype)
  };
}

export type CustomAttributeDecorator = <T extends Constructable>(target: T) => T & ICustomAttributeType<T>;
