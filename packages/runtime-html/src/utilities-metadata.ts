import { SimplerMetadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getOwnMetadata = SimplerMetadata.getMetadata;
/** @internal */ export const hasOwnMetadata = SimplerMetadata.hasMetadata;
/** @internal */ export const defineMetadata = SimplerMetadata.defineMetadata;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
/** @internal */ export const appendAnnotationKey = annotation.appendTo;
/** @internal */ export const getAllAnnotations = annotation.getKeys;
