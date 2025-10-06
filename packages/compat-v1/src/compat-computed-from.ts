import { computed } from '@aurelia/runtime';

export function computedFrom(...dependencies: (string | symbol)[]) {
  return function (target: () => unknown, context: ClassGetterDecoratorContext) {
    return computed({ deps: dependencies })(target, context);
  };
}
