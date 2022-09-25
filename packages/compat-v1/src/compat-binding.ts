/* eslint-disable no-console */
import { Unparser } from '@aurelia/runtime';
import { AttributeBinding, CallBinding, InterpolationPartBinding, LetBinding, Listener, PropertyBinding, RefBinding } from '@aurelia/runtime-html';
import { ContentBinding } from '@aurelia/runtime-html/dist/types/binding/interpolation-binding';

let defined = false;
export const defineBindingMethods = () => {
  if (defined) return;
  defined = true;

  ([
    [PropertyBinding, 'Property binding'],
    [AttributeBinding, 'Attribute binding'],
    [Listener, 'Listener binding'],
    [CallBinding, 'Call binding'],
    [LetBinding, 'Let binding'],
    [InterpolationPartBinding, 'Interpolation binding'],
    [ContentBinding, 'Text binding'],
    [RefBinding, 'Ref binding']
  ] as const).forEach(([b, name]) => {
    Object.defineProperty(
      b.prototype,
      'sourceExpression',
      {
        configurable: true, enumerable: false, writable: true, get(this: InstanceType<typeof b>) {
          console.warn(`@deprecated "sourceExpression" property for expression on ${name}. It has been renamed to "ast". expression: "${Unparser.unparse(this.ast)}"`);
          return this.ast;
        }
      }
    );
  });
};
