import { Constructable, Immutable, IRegistry } from '@aurelia/kernel';

export interface IResourceDefinition {
  name: string;
}

export interface IResourceKind<TSource, TType extends IResourceType<TSource> = IResourceType<TSource>> {
  readonly name: string;
  keyFrom(name: string): string;
  isType<T extends Constructable & Partial<TType>>(Type: T): Type is T & TType;
  define<T extends Constructable>(nameOrDefinition: string | TSource, ctor: T): T & TType;
}

export type ResourceDescription<TSource> = Immutable<Required<TSource>>;

export interface IResourceType<TSource = {}, T = {}> extends Constructable<T>, IRegistry {
  readonly kind: IResourceKind<TSource, this>;
  readonly description: ResourceDescription<TSource>;
}

export interface IResourceDescriptions {
  find<TSource>(kind: IResourceKind<TSource>, name: string): ResourceDescription<TSource> | null;
  create<TSource, TType extends IResourceType<TSource>>(kind: IResourceKind<TSource, TType>, name: string): InstanceType<TType> | null;
}
