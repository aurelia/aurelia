import { Unparser, Serializer } from './../../../debug/src/binding/unparser';
import { _, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { h } from '../../../../scripts/test-lib-dom';
import { expect } from 'chai';

export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (expected === null) {
    if (actual !== null) {
      expect(actual).to.be.null;
    }
  } else if (actual === null) {
    const expectedSerialized = Serializer.serialize(expected);
    expect(actual).to.equal(expectedSerialized);
  } else {
    const expectedSerialized = Serializer.serialize(expected);
    const expectedUnparsed = Unparser.unparse(expected);
    const actualSerialized = Serializer.serialize(actual);
    const actualUnparsed = Unparser.unparse(actual);
    if (actualSerialized !== expectedSerialized) {
      expect(actualSerialized).to.equal(expectedSerialized);
    }
    if (actualUnparsed !== expectedUnparsed) {
      expect(actualUnparsed).to.equal(expectedUnparsed);
    }
  }
}


export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
