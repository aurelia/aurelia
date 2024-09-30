import { Constructable } from '@aurelia/kernel';
import { IAstEvaluator } from './ast.eval';
import { rtDefineHiddenProp } from './utilities';
import { createMappedError, ErrorNames } from './errors';

/**
 * For Aurelia packages internal use only, do not use this in application code.
 *
 * Add ast evaluator mixin with throw implementation for all methods.
 */
export const mixinNoopAstEvaluator = (() => <T extends IAstEvaluator>(target: Constructable<T>) => {
  const proto = target.prototype;
  ['bindBehavior', 'unbindBehavior', 'bindConverter', 'unbindConverter', 'useConverter'].forEach(name => {
    rtDefineHiddenProp(proto, name, () => { throw createMappedError(ErrorNames.method_not_implemented, name); });
  });
})();
