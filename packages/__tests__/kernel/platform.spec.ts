import { PLATFORM, kebabCase, camelCase, toArray } from '@aurelia/kernel';
import { _, assert } from '@aurelia/testing';

// tslint:disable:no-typeof-undefined

const toString = Object.prototype.toString;

describe(`The PLATFORM object`, function () {
  if (typeof global !== 'undefined') {
    it(`global references global`, function () {
      assert.strictEqual(PLATFORM.global, global, `PLATFORM.global`);
    });
  }
  // @ts-ignore
  if (typeof self !== 'undefined') {
    it(`global references self`, function () {
      // @ts-ignore
      assert.strictEqual(PLATFORM.global, self, `PLATFORM.global`);
    });
  }
  // @ts-ignore
  if (typeof window !== 'undefined') {
    it(`global references window`, function () {
      // @ts-ignore
      assert.strictEqual(PLATFORM.global, window, `PLATFORM.global`);
    });
  }

  it(`now() returns a timestamp`, async function () {
    const $1 = PLATFORM.now();

    await Promise.resolve();
    const $2 = PLATFORM.now();
    assert.greaterThanOrEqualTo($2, $1, `$2`);

    await Promise.resolve();
    const $3 = PLATFORM.now();
    assert.greaterThanOrEqualTo($3, $2, `$3`);

    await Promise.resolve();
    const $4 = PLATFORM.now();
    assert.greaterThanOrEqualTo($4, $3, `$4`);

    await Promise.resolve();
    const $5 = PLATFORM.now();
    assert.greaterThanOrEqualTo($5, $4, `$5`);
  });

  it(`requestAnimationFrame() resolves after microtasks`, done => {
    let rafResolved = false;
    let promiseResolved = false;
    PLATFORM.requestAnimationFrame(() => {
      rafResolved = true;
      assert.strictEqual(promiseResolved, true, `promiseResolved`);
      done();
    });
    Promise.resolve().then(() => {
      Promise.resolve().then(() => {
        Promise.resolve().then(() => {
          assert.strictEqual(rafResolved, false, `rafResolved`);
          promiseResolved = true;
        }).catch(error => { throw error; });
      }).catch(error => { throw error; });
    }).catch(error => { throw error; });
  });

  describe(`camelCase()`, function () {
    for (const sep of ['.', '_', '-']) {
      for (const count of [1, 2]) {
        for (const prepend of [true, false]) {
          const f = prepend ? 'F' : 'f';
          for (const append of [true, false]) {
            for (const [[foo, bar, baz], expected] of [
              [['foo', 'bar', 'baz'], `${f}ooBarBaz`],
              [['Foo', 'Bar', 'Baz'], `${f}ooBarBaz`],
              [['FOO', 'BAR', 'BAZ'], `${f}OOBARBAZ`],
              [['fOO', 'bAR', 'bAZ'], `${f}OOBARBAZ`],
              [['foo', 'bar42', '42baz'], `${f}ooBar4242baz`]
            ]) {
              const actualSep = count === 1 ? sep : sep + sep;
              let input = [foo, bar, baz].join(actualSep);
              if (prepend) input = actualSep + input;
              if (append) input += actualSep;
              it(`${input} -> ${expected}`, function () {
                const actual = camelCase(input);
                assert.strictEqual(actual, expected, `actual`);
                assert.strictEqual(camelCase(input), actual, `camelCase(input)`); // verify via code coverage report that cache is being hit
              });
            }
          }
        }
      }
    }
  });

  describe(`kebabCase()`, function () {
    for (const [input, expected] of [
      ['FooBarBaz', 'foo-bar-baz'],
      ['fooBarBaz', 'foo-bar-baz'],
      ['foobarbaz', 'foobarbaz'],
      ['FOOBARBAZ', 'f-o-o-b-a-r-b-a-z'],
      ['fOObARbAZ', 'f-o-ob-a-rb-a-z']
    ]) {
      it(`${input} -> ${expected}`, function () {
        const actual = kebabCase(input);
        assert.strictEqual(actual, expected, `actual`);
        assert.strictEqual(kebabCase(input), actual, `kebabCase(input)`); // verify via code coverage report that cache is being hit
      });
    }
  });

  describe(`toArray()`, function () {
    for (const input of [
      [1, 2, 3, 4, 5],
      { length: 5, [1]: 1, [2]: 2, [3]: 3, [4]: 4, [5]: 5 }
    ] as ArrayLike<any>[]) {
      it(_`converts ${input} to array`, function () {
        const expected = Array.from(input);
        const actual = toArray(input);
        assert.strictEqual(typeof expected, typeof actual, `typeof expected`);
        assert.strictEqual(toString.call(expected), toString.call(actual), `toString.call(expected)`);
        assert.strictEqual(expected instanceof Array, actual instanceof Array, `expected instanceof Array`);
        assert.strictEqual(expected.length, actual.length, `expected.length`);
        for (let i = 0, ii = expected.length; i < ii; ++i) {
          assert.strictEqual(expected[i], actual[i], `expected[i]`);
        }
      });
    }
  });

});
