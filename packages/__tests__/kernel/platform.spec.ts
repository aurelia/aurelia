import { PLATFORM, kebabCase, camelCase, toArray } from '@aurelia/kernel';
import { _, assert } from '@aurelia/testing';

const toString = Object.prototype.toString;

const stringCases = [
  ['FooBarBaz', 'fooBarBaz', 'foo-bar-baz'],
  ['FooB', 'fooB', 'foo-b'],
  ['fooBar1Baz23', 'fooBar1Baz23', 'foo-bar1-baz23'],
  ['foobarbaz', 'foobarbaz', 'foobarbaz'],
  ['FOOBARBAZ', 'foobarbaz', 'foobarbaz'],
  ['FOOBarBAZ', 'fooBarBaz', 'foo-bar-baz'],
  ['FOOBarBaz', 'fooBarBaz', 'foo-bar-baz'],
  ['fOObARbAZ', 'fOObARbAz', 'f-o-ob-a-rb-az'],
  ['foo-bar-baz', 'fooBarBaz', 'foo-bar-baz'],
  ['foo-123-baz', 'foo123Baz', 'foo-123-baz'],
  ['Foo-Bar-Baz', 'fooBarBaz', 'foo-bar-baz'],
  ['FOO-BAR-BAZ', 'fooBarBaz', 'foo-bar-baz'],
  ['foo_bar_baz', 'fooBarBaz', 'foo-bar-baz'],
  ['Foo_Bar_Baz', 'fooBarBaz', 'foo-bar-baz'],
  ['FOO_BAR_BAZ', 'fooBarBaz', 'foo-bar-baz'],
  ['foo.bar.baz', 'fooBarBaz', 'foo-bar-baz'],
  ['Foo.Bar.Baz', 'fooBarBaz', 'foo-bar-baz'],
  ['FOO.BAR.BAZ', 'fooBarBaz', 'foo-bar-baz'],
  ['foo bar baz', 'fooBarBaz', 'foo-bar-baz'],
  ['Foo Bar Baz', 'fooBarBaz', 'foo-bar-baz'],
  ['FOO BAR BAZ', 'fooBarBaz', 'foo-bar-baz'],
  ['_foo_bar_', 'fooBar', 'foo-bar'],
  ['__foo__bar__', 'fooBar', 'foo-bar'],
  ['-foo-bar-', 'fooBar', 'foo-bar'],
  ['--foo--bar--', 'fooBar', 'foo-bar'],
  ['.foo.bar.', 'fooBar', 'foo-bar'],
  ['..foo..bar..', 'fooBar', 'foo-bar'],
  ['*foo*bar*', 'fooBar', 'foo-bar'],
  ['**foo**bar**', 'fooBar', 'foo-bar'],
  [' foo bar ', 'fooBar', 'foo-bar'],
  ['\t\tfoo\t\tbar\t\t', 'fooBar', 'foo-bar']
];

describe(`The PLATFORM object`, function () {
  if (typeof global !== 'undefined') {
    it(`global references global`, function () {
      assert.strictEqual(PLATFORM.global, global, `PLATFORM.global`);
    });
  }
  if (typeof self !== 'undefined') {
    it(`global references self`, function () {
      assert.strictEqual(PLATFORM.global, self, `PLATFORM.global`);
    });
  }
  if (typeof window !== 'undefined') {
    it(`global references window`, function () {
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

  it(`requestAnimationFrame() resolves after microtasks`, function(done) {
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
    for (const [input, expected] of stringCases) {
      it(`${input} -> ${expected}`, function () {
        const actual = camelCase(input);
        assert.strictEqual(actual, expected, `actual`);
        assert.strictEqual(camelCase(input), actual, `camelCase(input)`); // verify via code coverage report that cache is being hit
      });
    }
  });

  describe(`kebabCase()`, function () {
    for (const [input, _ignore, expected] of stringCases) {
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
