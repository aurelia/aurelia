import { Metadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getMetadata = Metadata.get;
/** @internal */ export const defineMetadata = Metadata.define;
/** @internal */ export const deleteMetadata = Metadata.delete;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
