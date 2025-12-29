import { Metadata } from '@aurelia/metadata';
import { Protocol } from '@aurelia/kernel';

/** @internal */ export const getMetadata = Metadata.get;
/** @internal */ export const hasMetadata = Metadata.has;
/** @internal */ export const defineMetadata = Metadata.define;

/**
 * Clear metadata from a target object.
 * Used by SSR to reset cached definitions before re-rendering.
 * @internal
 */
export const clearMetadata = (target: object, ...keys: string[]): void => {
  for (const key of keys) {
    Metadata.delete(key, target);
  }
};

const { annotation } = Protocol;
/** @internal */ export const getAnnotationKeyFor = annotation.keyFor;
