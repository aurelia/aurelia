import { Metadata } from '@aurelia/metadata';
import { Constructable, PartialResourceDefinition, Protocol, ResourceDefinition, StaticResourceType } from '@aurelia/kernel';

/** @internal */ export const getMetadata = Metadata.get;
/** @internal */ export const hasMetadata = Metadata.has;
/** @internal */ export const defineMetadata = Metadata.define;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;

/** @internal */export const staticResourceDefinitionMetadataKey = '__au_static_resource__';
/** @internal */ export const getDefinitionFromStaticAu = <Def extends ResourceDefinition, C extends Constructable = Constructable>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  Type: C | Function,
  typeName: string,
  createDef: (au: PartialResourceDefinition<Def>, Type: C) => Def,
): Def => {
  let def = getMetadata(staticResourceDefinitionMetadataKey, Type) as Def;
  if (def == null) {
    if ((Type as StaticResourceType<Def>).$au?.type === typeName) {
      def = createDef((Type as StaticResourceType<Def>).$au!, Type as C);
      defineMetadata(def, Type, staticResourceDefinitionMetadataKey);
    }
  }
  return def;
};
