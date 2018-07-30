import { Constructable, Immutable } from "../kernel/interfaces";
import { IRegistry } from "../kernel/di";

export interface IResourceKind<TSource, TType extends IResourceType<TSource> = IResourceType<TSource>> {
  readonly name: string;
  key(name: string): string;
  isType<T extends Constructable>(type: T): type is T & TType;
  define<T extends Constructable>(nameOrSource: string | TSource, ctor: T): T & TType;
}

export type ResourceDescription<TSource> = Immutable<Required<TSource>>;

export interface IResourceType<TSource = {}, T = {}> extends Constructable<T>, IRegistry {
  readonly kind: IResourceKind<TSource, this>;
  readonly description: ResourceDescription<TSource>;
}

export interface IResourceDescriptions {
  get<TSource>(kind: IResourceKind<TSource>, name: string): ResourceDescription<TSource> | null; 
}
