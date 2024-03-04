import { Metadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getOwnMetadata = Metadata.getOwn;
/** @internal */ export const hasOwnMetadata = Metadata.hasOwn;
/** @internal */ export const defineMetadata = Metadata.define;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
/** @internal */ export const appendAnnotationKey = annotation.appendTo;
/** @internal */ export const getAllAnnotations = annotation.getKeys;
