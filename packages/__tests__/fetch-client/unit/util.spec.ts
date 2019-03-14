import { expect } from 'chai';
import { json } from '../../src/util';

describe('util', function () {
  describe('json', function () {
    it('returns valid JSON', function () {
      const data = { test: 'data' };
      const result = JSON.parse(json(data));
      expect(data).to.deep.equal(result);
    });
  });
});
