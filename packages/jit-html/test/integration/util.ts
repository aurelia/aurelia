import { _, stringify, jsonStringify, htmlStringify, verifyEqual, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory } from '../../../../scripts/test-lib';
import { h, createElement } from '../../../../scripts/test-lib-dom';

let reg = /\s+/g;
export function trimFull(text: string) {
  return text.replace(reg, '');
}


export { _, h, stringify, jsonStringify, htmlStringify, verifyEqual, createElement, padRight, massSpy, massStub, massReset, massRestore, ensureNotCalled, eachCartesianJoin, eachCartesianJoinFactory };
