import { Metadata, Protocol } from '@aurelia/kernel';

/** @internal */
export const getOwnMetadata = Metadata.getOwn;
/** @internal */
export const hasOwnMetadata = Metadata.hasOwn;
/** @internal */
export const defineMetadata = Metadata.define;
/** @internal */
export const getAnnotationKeyFor = Protocol.annotation.keyFor;
/** @internal */
export const getResourceKeyFor = Protocol.resource.keyFor;
/** @internal */
export const appendResourceKey = Protocol.resource.appendTo;
