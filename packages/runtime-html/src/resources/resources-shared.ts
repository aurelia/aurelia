/** @internal */ export const dtElement = 'element';
/** @internal */ export const dtAttribute = 'attribute';

/** @internal */export const staticResourceDefinitionMetadataKey = '__au_static_resource__';

export interface IResourceKind {
  readonly name: string;
  keyFrom(name: string): string;
}
