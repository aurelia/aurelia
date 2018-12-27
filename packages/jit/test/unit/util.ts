import { expect } from 'chai';
import { Serializer, Unparser } from '../../../debug/src/binding/unparser';

export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
  if (expected === null) {
    if (actual !== null) {
      expect(actual).to.equal(null);
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
