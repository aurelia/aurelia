import { Metadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getMetadata = Metadata.getMetadata;
/** @internal */ export const hasMetadata = Metadata.hasMetadata;
/** @internal */ export const defineMetadata = Metadata.defineMetadata;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
