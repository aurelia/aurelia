import {
  Class,
  Constructable,
  IContainer,
  IResourceDefinition,
  IResourceKind,
  IResourceType,
  Registration,
  Writable
} from '@aurelia/kernel';

export interface IValueConverter {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
}

export interface IValueConverterDefinition extends IResourceDefinition { }

export interface IValueConverterType<C extends Constructable = Constructable> extends IResourceType<IValueConverterDefinition, InstanceType<C> & IValueConverter> { }

export interface IValueConverterResource extends
  IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> { }

function register(this: IValueConverterType, container: IContainer): void {
  const resourceKey = this.kind.keyFrom(this.description.name);
  container.register(Registration.singleton(resourceKey, this));
}

export function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator {
  return target => ValueConverterResource.define(nameOrDefinition, target);
}

function keyFrom(this: IValueConverterResource, name: string): string {
  return `${this.name}:${name}`;
}

function isType<T>(this: IValueConverterResource, Type: T & Partial<IValueConverterType>): Type is T & IValueConverterType {
  return Type.kind === this;
}

function define<T extends Constructable = Constructable>(this: IValueConverterResource, definition: IValueConverterDefinition, ctor: T): T & IValueConverterType<T>;
function define<T extends Constructable = Constructable>(this: IValueConverterResource, name: string, ctor: T): T & IValueConverterType<T>;
function define<T extends Constructable = Constructable>(this: IValueConverterResource, nameOrDefinition: string | IValueConverterDefinition, ctor: T): T & IValueConverterType<T>;
function define<T extends Constructable = Constructable>(this: IValueConverterResource, nameOrDefinition: string | IValueConverterDefinition, ctor: T): T & IValueConverterType<T> {
  const Type = ctor as T & Writable<IValueConverterType>;
  const description = typeof nameOrDefinition === 'string'
    ? { name: nameOrDefinition }
    : nameOrDefinition;

  Type.kind = ValueConverterResource;
  Type.description = description;
  Type.register = register;

  return Type as T & IValueConverterType<T>;
}

export const ValueConverterResource = {
  name: 'value-converter',
  keyFrom,
  isType,
  define
};

export type ValueConverterDecorator = <T extends Constructable>(target: T) => T & IValueConverterType<T>;
