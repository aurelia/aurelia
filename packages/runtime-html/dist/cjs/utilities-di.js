"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allResources = void 0;
const kernel_1 = require("@aurelia/kernel");
// todo: replace existing resource code with this resolver
// ===================
// export const resource = function <T extends Key>(key: T) {
//   function Resolver(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number) {
//     DI.inject(Resolver)(target, property, descriptor);
//   }
//   Resolver.$isResolver = true;
//   Resolver.resolve = function (handler: IContainer, requestor: IContainer) {
//     if (/* is root? */requestor.root === requestor) {
//       return requestor.get(key);
//     }
//     return requestor.has(key, false)
//       ? requestor.get(key)
//       : requestor.root.get(key);
//   };
//   return Resolver as IResolver<T> & ((...args: unknown[]) => any);
// };
/**
 * A resolver builder for resolving all registrations of a key
 * with resource semantic (leaf + root + ignore middle layer container)
 */
const allResources = function (key) {
    function Resolver(target, property, descriptor) {
        kernel_1.DI.inject(Resolver)(target, property, descriptor);
    }
    Resolver.$isResolver = true;
    Resolver.resolve = function (handler, requestor) {
        if ( /* is root? */requestor.root === requestor) {
            return requestor.getAll(key, false);
        }
        return requestor.has(key, false)
            ? requestor.getAll(key, false).concat(requestor.root.getAll(key, false))
            : requestor.root.getAll(key, false);
    };
    return Resolver;
};
exports.allResources = allResources;
//# sourceMappingURL=utilities-di.js.map