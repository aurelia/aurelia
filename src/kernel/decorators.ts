import { Injectable } from "./interfaces";
import { DI } from "./di";

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class.
*/
export function autoinject<T extends Injectable>(potentialTarget?: T): any {
  let deco = function<T extends Injectable>(target: T) {
    let previousInject = target.inject ? target.inject.slice() : null; //make a copy of target.inject to avoid changing parent inject
    let autoInject: any = DI.getDesignParamTypes(target);
    
    if (!previousInject) {
      target.inject = autoInject;
    } else {
      for (let i = 0; i < autoInject.length; i++) {
        //check if previously injected.
        if (previousInject[i] && previousInject[i] !== autoInject[i]) {
          const prevIndex = previousInject.indexOf(autoInject[i]);
          if (prevIndex > -1) {
            previousInject.splice(prevIndex, 1);
          }
          previousInject.splice((prevIndex > -1 && prevIndex < i) ? i - 1 : i, 0, autoInject[i]);
        } else if (!previousInject[i]) {//else add
          previousInject[i] = autoInject[i];
        }
      }

      target.inject = previousInject;
    }
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decoratored class/function.
*/
export function inject(...rest: any[]): any {
  return function<T extends Injectable>(target: T, key?, descriptor?) {
    // handle when used as a parameter
    if (typeof descriptor === 'number' && rest.length === 1) {
      let params = target.inject;

      if (!params) {
        params = DI.getDesignParamTypes(target).slice();
        target.inject = params;
      }

      params[descriptor] = rest[0];
      return;
    }

    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}
