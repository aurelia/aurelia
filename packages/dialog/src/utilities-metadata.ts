import { Metadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getOwnMetadata = Metadata.getOwn;
/** @internal */ export const defineMetadata = Metadata.define;

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
