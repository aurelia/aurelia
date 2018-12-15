export function observable(targetOrConfig?: any, key?: string, descriptor?: PropertyDescriptor) {
  function deco(target, key, descriptor, config?) { // eslint-disable-line no-shadow
    // class decorator?
    const isClassDecorator = key === undefined;
    if (isClassDecorator) {
      target = target.prototype;
      key = typeof config === 'string' ? config : config.name;
    }

    // use a convention to compute the inner property name
    let innerPropertyName = `_${key}`;
    const innerPropertyDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      writable: true
    };

    // determine callback name based on config or convention.
    const callbackName = (config && config.changeHandler) || `${key}Changed`;

    if (descriptor) {
      // babel passes in the property descriptor with a method to get the initial value.

      // set the initial value of the property if it is defined.
      if (typeof descriptor.initializer === 'function') {
        innerPropertyDescriptor.value = descriptor.initializer();
      }
    } else {
      // there is no descriptor if the target was a field in TS (although Babel provides one),
      // or if the decorator was applied to a class.
      descriptor = {};
    }
    // make the accessor enumerable by default, as fields are enumerable
    if (!('enumerable' in descriptor)) {
      descriptor.enumerable = true;
    }

    // we're adding a getter and setter which means the property descriptor
    // cannot have a "value" or "writable" attribute
    delete descriptor.value;
    delete descriptor.writable;
    delete descriptor.initializer;

    // Add the inner property on the prototype.
    Reflect.defineProperty(target, innerPropertyName, innerPropertyDescriptor);

    // add the getter and setter to the property descriptor.
    descriptor.get = function() { return this[innerPropertyName]; };
    descriptor.set = function(newValue) {
      let oldValue = this[innerPropertyName];
      if (newValue === oldValue) {
        return;
      }

      // Add the inner property on the instance and make it nonenumerable.
      this[innerPropertyName] = newValue;
      Reflect.defineProperty(this, innerPropertyName, { enumerable: false });

      if (this[callbackName]) {
        this[callbackName](newValue, oldValue, key);
      }
    };

    // make sure Aurelia doesn't use dirty-checking by declaring the property's
    // dependencies. This is the equivalent of "@computedFrom(...)".
    descriptor.get.dependencies = [innerPropertyName];

    if (isClassDecorator) {
      Reflect.defineProperty(target, key, descriptor);
    } else {
      return descriptor;
    }
  }

  if (key === undefined) {
    // parens...
    return (t, k, d) => deco(t, k, d, targetOrConfig);
  }
  return deco(targetOrConfig, key, descriptor);
}

/*
          | typescript       | babel
----------|------------------|-------------------------
property  | config           | config
w/parens  | target, key      | target, key, descriptor
----------|------------------|-------------------------
property  | target, key      | target, key, descriptor
no parens | n/a              | n/a
----------|------------------|-------------------------
class     | config           | config
          | target           | target
*/
