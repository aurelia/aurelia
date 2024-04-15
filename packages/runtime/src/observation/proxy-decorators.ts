import { Class, Constructable } from '@aurelia/kernel';
import { defineHiddenProp, safeString } from '../utilities';
import { nowrapClassKey, nowrapPropKey } from './proxy-observation';

/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
// for
//    @nowrap
//    class {}
export function nowrap(target: Constructable, context: ClassDecoratorContext): void;
// for
//    class {
//      @nowrap prop
//    }
export function nowrap(target: undefined, context: ClassFieldDecoratorContext): void;
/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
export function nowrap<
  TThis extends object
>(
  target: Class<TThis> | undefined,
  context: ClassDecoratorContext<Class<TThis>> | ClassFieldDecoratorContext<TThis>
): void {
  switch (context.kind) {
    case 'class':
      defineHiddenProp(target!, nowrapClassKey, true);
      break;
    case 'field':
      context.addInitializer(function (this: object) {
        const target = this.constructor;
        const property = `${nowrapPropKey}_${safeString(context.name)}__`;
        if (property in target) return;
        defineHiddenProp(target, property, true);
      });
      break;
  }
}

/* eslint-disable */
// this is a test and will be automatically removed by dead code elimination
function testNowrap() {
  @nowrap
  class MyModel {}

  class MyModel3 {
    @nowrap public prop = 1;
  }
}
/* eslint-enable */
