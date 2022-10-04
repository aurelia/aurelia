/* eslint-disable no-console */
import { Unparser } from '@aurelia/runtime';
import { AttributeBinding, ContentBinding, InterpolationPartBinding, LetBinding, ListenerBinding, PropertyBinding, RefBinding } from '@aurelia/runtime-html';
import { CallBinding } from './compat-call';
import { DelegateListenerBinding } from './compat-delegate';

let defined = false;
export const defineBindingMethods = () => {
  if (defined) return;
  defined = true;

  ([
    [PropertyBinding, 'Property binding'],
    [AttributeBinding, 'Attribute binding'],
    [ListenerBinding, 'Listener binding'],
    [CallBinding, 'Call binding'],
    [LetBinding, 'Let binding'],
    [InterpolationPartBinding, 'Interpolation binding'],
    [ContentBinding, 'Text binding'],
    [RefBinding, 'Ref binding'],
    [DelegateListenerBinding, 'Delegate Listener binding']
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
