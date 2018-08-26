import { placeholder } from '@aurelia/aot';
import { expect } from 'chai';

describe('index', () => {
  it('placeholder should be null', () => {
    expect(placeholder).to.be.null;
  });
});

