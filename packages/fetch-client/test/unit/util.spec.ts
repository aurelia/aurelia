import { expect } from 'chai';
import { json } from '../../src/util';

describe('util', () => {
  describe('json', () => {
    it('returns valid JSON', () => {
      const data = { test: 'data' };
      const result = JSON.parse(json(data));
      expect(data).to.equal(result);
    });
  });
});
