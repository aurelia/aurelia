/** @internal */ export const dtElement = 'element';
/** @internal */ export const dtAttribute = 'attribute';

export interface IResourceKind {
  readonly name: string;
  keyFrom(name: string): string;
  // we may provide this as common API for all resource kinds
  // registerAliases(container: IContainer, Type: ResourceType, ...keys: string[]): void;
}
