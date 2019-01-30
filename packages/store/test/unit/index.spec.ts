import { expect } from 'chai';
import { placeholder } from '../../src/index';

describe('index', () => {
  it('placeholder should be null', () => {
    expect(placeholder).to.equal(null);
  });
});
