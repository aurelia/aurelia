import { expect } from 'chai';

export function verifyEqual(actual: any, expected: any): any {
  if (typeof expected !== 'object' || expected === null || expected === undefined) {
    expect(actual).to.equal(expected);
    return;
  }
  if (expected instanceof Array) {
    for (let i = 0; i < expected.length; i++) {
      verifyEqual(actual[i], expected[i]);
    }
    return;
  }

  if (actual) {
    expect(actual.constructor.name).to.equal(expected.constructor.name);
    expect(actual.toString()).to.equal(expected.toString());
    for (const prop of Object.keys(expected)) {
      verifyEqual(actual[prop], expected[prop]);
    }
  }
}
