import * as ts from 'typescript';

import { IBindable } from './interfaces';
import { getPropertyName } from './ts-util';

/**
 * Extract information of a bindable decorator into predefined object
 * @param prop the property that has @bindable decorator
 * @param bindableDecorator the @bindable decorator
 * @param bindable destination object for storing extracted information
 */
export function extractBindable(prop: ts.PropertyDeclaration, bindableDecorator: ts.Decorator, bindable: IBindable): IBindable {
  let name = getPropertyName(prop);
  let expression = bindableDecorator.expression;

  bindable.name = name;

  if (ts.isCallExpression(expression)) {
    let args = expression.arguments;
    if (!args || !args.length) {
      return bindable;
    }
    if (args.length > 1) {
      console.log('@bindable() was called with more than 1 arguments...');
    }
    let config = args[0];
    if (ts.isStringLiteral(config)) {
      throw new Error('Invalid @bindable call. Cannot use with string on a class field');
    }
    if (!ts.isObjectLiteralExpression(config)) {
      throw new Error('Invalid @bindable call. Only support object literal on class field.');
    }
    let props = config.properties;
    for (let i = 0, ii = props.length; ii > i; ++i) {
      let prop = props[i];
      let propName = prop.name;
      if (!propName || !ts.isIdentifier(propName)) {
        throw new Error('Cannot support non literal @bindable config properties.');
      }
      let name = propName.escapedText.toString();
      if (name === 'defaultBindingMode') {
        
      }
    }
    return bindable;
  } else if (ts.isIdentifier(expression)) {
    return bindable;
  } else {
    throw new Error('Expected @bindable / @bindable() / @bindable(...args: any[]). Given something else');
  }
}
