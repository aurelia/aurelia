/* eslint-disable no-console */
import { IsExpressionOrStatement, Unparser } from '@aurelia/runtime';
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
        configurable: true,
        enumerable: false,
        get(this: InstanceType<typeof b>) {
          console.warn(getMessage(name, this.ast));
          return this.ast;
        },
        set(this: InstanceType<typeof b>, v: unknown) {
          console.warn(getMessage(name, this.ast));
          Reflect.set(this, 'ast', v);
        }
       }
    );
  });

  const getMessage = (name: string, ast: IsExpressionOrStatement) => console.warn(`@deprecated "sourceExpression" property for expression on ${name}. It has been renamed to "ast". expression: "${Unparser.unparse(ast)}"`);
};
