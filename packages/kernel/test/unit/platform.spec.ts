import { PLATFORM } from './../../src/platform';
import { expect } from 'chai';
import { createElement, _ } from './util';

const toString = Object.prototype.toString;

describe(`The PLATFORM object`, () => {
  it(`global references window`, () => {
    expect(PLATFORM.global).to.equal(window);
  });

  it(`now() returns a timestamp`, async () => {
    const $1 = PLATFORM.now();

    await Promise.resolve();
    const $2 = PLATFORM.now();
    expect($2).to.be.gte($1);

    await Promise.resolve();
    const $3 = PLATFORM.now();
    expect($3).to.be.gte($2);

    await Promise.resolve();
    const $4 = PLATFORM.now();
    expect($4).to.be.gte($3);

    await Promise.resolve();
    const $5 = PLATFORM.now();
    expect($5).to.be.gte($4);
  });

  it(`requestAnimationFrame() resolves after microtasks`, done => {
    let rafResolved = false;
    let promiseResolved = false;
    PLATFORM.requestAnimationFrame(() => {
      rafResolved = true;
      expect(promiseResolved).to.be.true;
      done();
    });
    Promise.resolve().then(() => {
      Promise.resolve().then(() => {
        Promise.resolve().then(() => {
          expect(rafResolved).to.be.false;
          promiseResolved = true;
        });
      });
    });
  });

  describe(`camelCase()`, () => {
    for (const sep of ['.', '_', '-']) {
      for (const count of [1, 2]) {
        for (const prepend of [true, false]) {
          const f = prepend ? 'F' : 'f';
          for (const append of [true, false]) {
            for (const [[foo, bar, baz], expected] of [
              [['foo', 'bar', 'baz'], f+'ooBarBaz'],
              [['Foo', 'Bar', 'Baz'], f+'ooBarBaz'],
              [['FOO', 'BAR', 'BAZ'], f+'OOBARBAZ'],
              [['fOO', 'bAR', 'bAZ'], f+'OOBARBAZ'],
              [['foo', 'bar42', '42baz'], f+'ooBar4242baz']
            ]) {
              const actualSep = count === 1 ? sep : sep+sep;
              let input = [foo, bar, baz].join(actualSep);
              if (prepend) input = actualSep + input;
              if (append) input += actualSep;
              it(`${input} -> ${expected}`, () => {
                const actual = PLATFORM.camelCase(input);
                expect(actual).to.equal(expected);
                expect(PLATFORM.camelCase(input)).to.equal(actual); // verify via code coverage report that cache is being hit
              });
            }
          }
        }
      }
    }
  });

  describe(`kebabCase()`, () => {
    for (const [input, expected] of [
      ['FooBarBaz', 'foo-bar-baz'],
      ['fooBarBaz', 'foo-bar-baz'],
      ['foobarbaz', 'foobarbaz'],
      ['FOOBARBAZ', 'f-o-o-b-a-r-b-a-z'],
      ['fOObARbAZ', 'f-o-ob-a-rb-a-z']
    ]) {
      it(`${input} -> ${expected}`, () => {
        const actual = PLATFORM.kebabCase(input);
        expect(actual).to.equal(expected);
        expect(PLATFORM.kebabCase(input)).to.equal(actual); // verify via code coverage report that cache is being hit
      });
    }
  });

  describe(`toArray()`, () => {
    for (const input of <ArrayLike<any>[]>[
      [1, 2, 3, 4, 5],
      createElement('<div><div></div><div></div><div></div><div></div><div></div></div>').childNodes
    ]) {
      it(_`converts ${input} to array`, () => {
        const expected = Array.from(input);
        const actual = PLATFORM.toArray(input);
        expect(typeof expected).to.equal(typeof actual);
        expect(toString.call(expected)).to.equal(toString.call(actual));
        expect(expected instanceof Array).to.equal(actual instanceof Array);
        expect(expected.length).to.equal(actual.length);
        for (let i = 0, ii = expected.length; i < ii; ++i) {
          expect(expected[i]).to.equal(actual[i]);
        }
      });
    }
  });

});
