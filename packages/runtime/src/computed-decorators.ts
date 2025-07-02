import { computedPropInfo } from './object-property-info';

/**
 * Decorate a getter to configure various aspects of the computed property created by the getter.
 *
 * Example usage:
 *
 * ```ts
 * export class MyElement {
 *  \@computed({ flush: 'sync' })
 *   public get prop(): number {
 *     return 24;
 *   }
 * }
 * ```
 */
export function computed<
  TThis extends object
>(
  options: {
    flush?: 'sync' | 'async';
    // todo: future improvement
    // dependencies?: (string | symbol)[];
  }
) {
  return function decorator(
    target: () => unknown,
    context: ClassGetterDecoratorContext<TThis>
  ) {
    context.addInitializer(function (this: object) {
      const flush = options.flush ?? 'async';
      computedPropInfo.set(this, context.name, { flush });
    });
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function testComputed() {

  // normal usages
  class MyClass {
    @computed({ flush: 'sync' })
    public get prop2(): number {
      return 2;
    }

    @computed({ flush: 'async' })
    public get prop3(): number {
      return 2;
    }
  }

  // @ts-expect-error - classes arent supported
  @computed({ flush: 'sync' })
  class MyModel {
    // @ts-expect-error - needs options
    @computed()
    public get prop1(): number {
      return 1;
    }

    // @ts-expect-error - methods arent supported
    @computed
    public prop() {
      return 1;
    }
  }

  class MyModel2 {
    private v: number = 1;
    // @ts-expect-error setters arent supported
    @computed({ flush: 'async' })
    public set prop(v: number) {
      this.v = v;
    }
  }
}
