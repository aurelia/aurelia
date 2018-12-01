import { Class, Constructable, IContainer, Registration, Writable } from '../../kernel';
import { IResourceDefinition, IResourceKind, IResourceType } from '../resource';

export interface IValueConverter {
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
}

export interface IValueConverterDefinition extends IResourceDefinition { }

export interface IValueConverterType extends IResourceType<IValueConverterDefinition, IValueConverter> { }

export interface IValueConverterResource extends
  IResourceKind<IValueConverterDefinition, IValueConverter, Class<IValueConverter>> { }

type ValueConverterDecorator = <TProto, TClass>(target: Class<TProto, TClass> & Partial<IValueConverterType>) => Class<TProto, TClass> & IValueConverterType;

function register(this: IValueConverterType, container: IContainer): void {
  const resourceKey = this.kind.keyFrom(this.description.name);
  container.register(Registration.singleton(resourceKey, this));
}

export function valueConverter(name: string): ValueConverterDecorator;
export function valueConverter(definition: IValueConverterDefinition): ValueConverterDecorator;
export function valueConverter(nameOrDefinition: string | IValueConverterDefinition): ValueConverterDecorator {
  return target => ValueConverterResource.define(nameOrDefinition, target);
}

function keyFrom(this: IValueConverterResource, name: string): string {
  return `${this.name}:${name}`;
}

function isType<T>(this: IValueConverterResource, Type: T & Partial<IValueConverterType>): Type is T & IValueConverterType {
  return Type.kind === this;
}

function define<T extends Constructable>(this: IValueConverterResource, name: string, ctor: T): T & IValueConverterType;
function define<T extends Constructable>(this: IValueConverterResource, ndefinition: IValueConverterDefinition, ctor: T): T & IValueConverterType;
function define<T extends Constructable>(this: IValueConverterResource, nameOrDefinition: string | IValueConverterDefinition, ctor: T): T & IValueConverterType {
  const Type = ctor as T & Writable<IValueConverterType>;
  const description = typeof nameOrDefinition === 'string'
    ? { name: nameOrDefinition }
    : nameOrDefinition;

  Type.kind = ValueConverterResource;
  Type.description = description;
  Type.register = register;

  return Type;
}

export const ValueConverterResource: IValueConverterResource = {
  name: 'value-converter',
  keyFrom,
  isType,
  define
};
