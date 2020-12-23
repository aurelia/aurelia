import { all, DI, IContainer, inject, lazy, optional, Registration, singleton } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('DI.get', function () {
  let container: IContainer;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    container = DI.createContainer();
  });

  describe('@lazy', function () {
    class Bar {

    }
    class Foo {
      public constructor(@lazy(Bar) public readonly provider: () => Bar) {}
    }
    it('@singleton', function () {
      const bar0 = container.get(Foo).provider();
      const bar1 = container.get(Foo).provider();

      assert.strictEqual(bar0, bar1);
    });

    it('@transient', function () {
      container.register(Registration.transient(Bar, Bar));
      const bar0 = container.get(Foo).provider();
      const bar1 = container.get(Foo).provider();

      assert.notStrictEqual(bar0, bar1);
    });
  });

  describe('@scoped', function () {
    describe("true", function () {
      @singleton({ scoped: true })
      class ScopedFoo { }

      describe('Foo', function () {
        const constructor = ScopedFoo;
        it('children', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = child1.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.notStrictEqual(a, b, 'a and b are not the same');
          assert.strictEqual(root.has(constructor, false), false, 'root has class');
          assert.strictEqual(child1.has(constructor, false), true, 'child1 has class');
          assert.strictEqual(child2.has(constructor, false), true, 'child2 has class');
        });

        it('root', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = root.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.strictEqual(a, b, 'a and b are the same');
          assert.strictEqual(root.has(constructor, false), true, 'root has class');
          assert.strictEqual(child1.has(constructor, false), false, 'child1 does not have class');
          assert.strictEqual(child2.has(constructor, false), false, 'child2 does not have class');
        });
      });
    });

    describe('false', function () {
      @singleton({ scoped: false })
      class ScopedFoo { }

      describe('Foo', function () {
        const constructor = ScopedFoo;
        it('children', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = child1.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.strictEqual(a, b, 'a and b are the same');
          assert.strictEqual(root.has(constructor, false), true, 'root has class');
          assert.strictEqual(child1.has(constructor, false), false, 'child1 has class');
          assert.strictEqual(child2.has(constructor, false), false, 'child2 has class');
        });
      });

      describe('default', function () {
        @singleton
        class DefaultFoo { }

        const constructor = DefaultFoo;
        it('children', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = child1.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.strictEqual(a, b, 'a and b are the same');
          assert.strictEqual(root.has(constructor, false), true, 'root has class');
          assert.strictEqual(child1.has(constructor, false), false, 'child1 has class');
          assert.strictEqual(child2.has(constructor, false), false, 'child2 has class');
        });
      });
    });
  });

  describe('@optional', function () {
    it('with default', function () {
      class Foo {
        public constructor(@optional('key') public readonly test: string = 'hello') {}
      }

      assert.strictEqual(container.get(Foo).test, 'hello');
    });

    it('no default, but param allows undefined', function () {
      class Foo {
        public constructor(@optional('key') public readonly test?: string) {}
      }

      assert.strictEqual(container.get(Foo).test, undefined);
    });

    it('no default, param does not allow undefind', function () {
      class Foo {
        public constructor(@optional('key') public readonly test: string) {}
      }

      assert.strictEqual(container.get(Foo).test, undefined);
    });

    it('interface with default', function () {
      const Strings = DI.createInterface<string[]>(x => x.instance([]));
      class Foo {
        public constructor(@optional(Strings) public readonly test: string[]) {}
      }

      assert.deepStrictEqual(container.get(Foo).test, undefined);
    });

    it('interface with default and default in constructor', function () {
      const MyStr = DI.createInterface<string>(x => x.instance('hello'));
      class Foo {
        public constructor(@optional(MyStr) public readonly test: string = 'test') {}
      }

      assert.deepStrictEqual(container.get(Foo).test, 'test');
    });

    it('interface with default registered and default in constructor', function () {
      const MyStr = DI.createInterface<string>(x => x.instance('hello'));
      container.register(MyStr);
      class Foo {
        public constructor(@optional(MyStr) public readonly test: string = 'test') {}
      }

      assert.deepStrictEqual(container.get(Foo).test, 'hello');
    });
  });

  describe('intrinsic', function () {

    describe('bad', function () {

      it('Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: string[]) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('ArrayBuffer', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: ArrayBuffer) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Boolean', function () {
        @singleton
        class Foo {
          // eslint-disable-next-line @typescript-eslint/ban-types
          public constructor(private readonly test: Boolean) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('boolean', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: boolean) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('DataView', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: DataView) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Date', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Date) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
      it('Error', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Error) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('EvalError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: EvalError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Float32Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Float32Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Float64Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Float64Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Function', function () {
        @singleton
        class Foo {
          // eslint-disable-next-line @typescript-eslint/ban-types
          public constructor(private readonly test: Function) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Int8Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Int8Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Int16Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Int16Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Int32Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Int16Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Map', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Map<unknown, unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Number', function () {
        @singleton
        class Foo {
          // eslint-disable-next-line @typescript-eslint/ban-types
          public constructor(private readonly test: Number) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('number', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: number) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Object', function () {
        @singleton
        class Foo {
          // eslint-disable-next-line @typescript-eslint/ban-types
          public constructor(private readonly test: Object) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('object', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: object) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Promise', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Promise<unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('RangeError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: RangeError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('ReferenceError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: ReferenceError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('RegExp', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: RegExp) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Set', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Set<unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      if (typeof SharedArrayBuffer !== 'undefined') {
        it('SharedArrayBuffer', function () {
          @singleton
          class Foo {
            public constructor(private readonly test: SharedArrayBuffer) {
            }
          }
          assert.throws(() => container.get(Foo));
        });
      }

      it('String', function () {
        @singleton
        class Foo {
          // eslint-disable-next-line @typescript-eslint/ban-types
          public constructor(private readonly test: String) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('string', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: string) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('SyntaxError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: SyntaxError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('TypeError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: TypeError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Uint8Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint8Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Uint8ClampedArray', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint8ClampedArray) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Uint16Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint16Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
      it('Uint32Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint32Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
      it('UriError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: URIError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('WeakMap', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: WeakMap<any, unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('WeakSet', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: WeakSet<any>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
    });

    describe('good', function () {
      it('@all()', function () {
        class Foo {
          public constructor(@all('test') public readonly test: string[]) {
          }
        }
        assert.deepStrictEqual(container.get(Foo).test, []);
      });
      it('@optional()', function () {
        class Foo {
          public constructor(@optional('test') public readonly test: string = null) {
          }
        }
        assert.strictEqual(container.get(Foo).test, null);
      });

      it('undef instance, with constructor default', function () {
        container.register(Registration.instance('test', undefined));
        class Foo {
          public constructor(@inject('test') public readonly test: string[] = []) {
          }
        }
        assert.deepStrictEqual(container.get(Foo).test, []);
      });

      it('can inject if registered', function () {
        container.register(Registration.instance(String, 'test'));
        @singleton
        class Foo {
          public constructor(public readonly test: string) {
          }
        }
        assert.deepStrictEqual(container.get(Foo).test, 'test');
      });
    });
  });
});
