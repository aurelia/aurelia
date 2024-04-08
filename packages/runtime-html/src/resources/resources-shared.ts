/** @internal */ export const dtElement = 'element';
/** @internal */ export const dtAttribute = 'attribute';

export interface IResourceKind {
  readonly name: string;
  keyFrom(name: string): string;
}
