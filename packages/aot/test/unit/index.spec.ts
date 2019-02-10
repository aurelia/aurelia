import { expect } from 'chai';
import { placeholder } from '../../src/index';

describe('index', function() {
  it('placeholder should be null', function() {
    expect(placeholder).to.equal(null);
  });
});
