/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/promise-function-async */
import { Runner } from '@aurelia/router';
import { assert } from '@aurelia/testing';

const createTimedPromise = (value, time, previousValue?, reject = false): Promise<unknown> => {
  return new Promise((res, rej) => {
    // console.log(`(promise ${value})`);
    setTimeout(() => {
      // console.log(value, `(${previousValue})`);
      if (reject) {
        rej(`REJECTED ${value}`);
      } else {
        res(value);
      }
    }, time);
  });
};

describe('Runner', function () {
  this.timeout(30000);

  const oneTests = [
    { step: 1, result: 1 },
    { step: 'one', result: 'one' },
    { step: () => 'one', result: 'one' },
    { step: createTimedPromise('one', 100), result: 'one' },
    { step: createTimedPromise(createTimedPromise('two', 100), 100), result: 'two' },
    { step: createTimedPromise(createTimedPromise(() => 'three', 100), 100), result: 'three' },
    { step: () => createTimedPromise(createTimedPromise(() => 'four', 100), 100), result: 'four' },
  ];

  for (let i = 0; i < oneTests.length; i++) {
    const test = oneTests[i];
    it(`runs one "${test.step}" => "${test.result}"`, function () {
      const result = Runner.runOne(test.step);
      if (result instanceof Promise) {
        return result.then(resolved => {
          assert.strictEqual(resolved, test.result, `#${i}`);
        }).catch(err => { throw err; });
      } else {
        assert.strictEqual(result, test.result, `#${i}`);
      }
    });
  }

  const tests = [
    {
      steps: [
        (prev) => `one (${prev})`,
        (prev) => `two (${prev})`,
        (prev) => createTimedPromise(`three (${prev})`, 2000),
        (prev) => createTimedPromise(`four (${prev})`, 1000),
      ],
      result: 'four (three (two (one (undefined))))',
      cancelled: 'two (one (undefined))',
      results: ['one (undefined)', 'two (undefined)', 'three (undefined)', 'four (undefined)'],
    },
    {
      steps: [
        (prev) => createTimedPromise(`four (${prev})`, 1000),
        (prev) => createTimedPromise(`three (${prev})`, 2000),
        (prev) => `two (${prev})`,
        (prev) => `one (${prev})`,
      ],
      result: 'one (two (three (four (undefined))))',
      cancelled: 'four (undefined)',
      results: ['four (undefined)', 'three (undefined)', 'two (undefined)', 'one (undefined)'],
    },
  ];
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`runs sequence ${test.steps} => ${test.result}`, function () {
      const stepsPromise = Runner.run(...test.steps) as Promise<unknown>;
      stepsPromise.then(result => {
        assert.strictEqual(result, test.result, `#${i}`);
      }).catch(err => { throw err; });
    });
  }

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`cancels sequence ${test.steps} => ${test.cancelled}`, function () {
      const stepsPromise = Runner.run(...test.steps) as Promise<unknown>;
      setTimeout(() => {
        Runner.cancel(stepsPromise);
      }, 1500);
      stepsPromise.then(result => {
        assert.strictEqual(result, test.cancelled, `#${i}`);
      }).catch(err => { throw err; });
    });
  }

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`runs all ${test.steps} => ${test.results}`, function () {
      const stepsPromise = Runner.runAll(test.steps) as Promise<unknown>;
      stepsPromise.then((results: unknown[]) => {
        assert.strictEqual(results.join(','), test.results.join(','), `#${i}`);
      }).catch(err => { throw err; });
    });
  }
});
