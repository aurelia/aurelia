import { Constructable } from '@aurelia/kernel';
import { defineHiddenProp, safeString } from '../utilities';
import { nowrapClassKey, nowrapPropKey } from './proxy-observation';

/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
// for
//    @nowrap
//    class {}

export function nowrap(target: Constructable): void;
// for
//    class {
//      @nowrap prop
//    }
export function nowrap(target: object, key: PropertyKey, descriptor?: PropertyDescriptor): void;
// for
//    @nowrap()
//    class {}
// or
//    class { @nowrap() prop }
// returning any just for TS, as it is unable to selectively choose whether it's a class decorator or prop decorator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nowrap(): ClassDecorator | PropertyDecorator | any; // (target: Constructable | object, key: PropertyKey, descriptor?: PropertyDescriptor) => void;

// base signature
export function nowrap(
  target?: Constructable | object,
  key?: PropertyKey,
  descriptor?: PropertyDescriptor
): ClassDecorator | PropertyDecorator;
/**
 * A decorator to signal proxy observation shouldn't make an effort to wrap an object
 */
export function nowrap(
  target?: Constructable | object,
  key?: PropertyKey
): void | ClassDecorator | PropertyDecorator {
  if (target == null) {
    // for
    //    @nowrap()
    //    class {}
    // or
    //    class { @nowrap() prop }
    return (t: Constructable | object, k?: PropertyKey) => deco(t, k);
  } else {
    // for
    //    @nowrap
    //    class {}
    // or
    //    class {
    //      @nowrap prop
    //    }
    return deco(target, key);
  }

  function deco(
    target: Constructable | object,
    key?: PropertyKey
  ): void | ClassDecorator | PropertyDecorator {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const isClassDecorator = !key;

    if (isClassDecorator) {
      defineHiddenProp(target, nowrapClassKey, true);
    } else {
      // defining on the constructor means inheritance lookup is supported
      defineHiddenProp((target as object).constructor, `${nowrapPropKey}_${safeString(key)}__`, true);
    }
  }
}

/* eslint-disable */
// this is a test and will be automatically removed by dead code elimination
function testNowrap() {
  @nowrap
  class MyModel {}

  @nowrap()
  class MyModel2 {}
  
  class MyModel3 {
    @nowrap public prop = 1;
  }
  
  class MyModel4 {
    @nowrap() public prop = 2;
  }
}
/* eslint-enable */
