import { Constructable, PartialResourceDefinition, ResourceDefinition, StaticResourceType } from '@aurelia/kernel';
import { defineMetadata, getMetadata } from '../utilities-metadata';

/** @internal */ export const dtElement = 'custom-element';
/** @internal */ export const dtAttribute = 'custom-attribute';

export interface IResourceKind {
  readonly name: string;
  keyFrom(name: string): string;
}

/** @internal */ export const getDefinitionFromStaticAu = <Def extends ResourceDefinition, C extends Constructable = Constructable>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  Type: C | Function,
  typeName: string,
  createDef: (au: PartialResourceDefinition<Def>, Type: C) => Def,
  metadataKey = '__au_static_resource__'
): Def => {
  let def = getMetadata(metadataKey, Type) as Def;
  if (def == null) {
    if ((Type as StaticResourceType<Def>).$au?.type === typeName) {
      def = createDef((Type as StaticResourceType<Def>).$au!, Type as C);
      defineMetadata(def, Type, metadataKey);
    }
  }
  return def;
};
