import { Metadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getMetadata = Metadata.getMetadata;
/** @internal */ export const defineMetadata = Metadata.defineMetadata;
/** @internal */ export const deleteMetadata = Metadata.deleteMetadata;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
