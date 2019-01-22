import { json } from '../../src/util';

describe('util', () => {
  describe('json', () => {
    it('returns valid JSON', () => {
      let data = { test: 'data' };
      let result = JSON.parse(json(data));
      expect(data).toEqual(result);
    });
  });
});
