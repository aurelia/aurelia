import { expect } from 'chai';
import { Reporter } from '@aurelia/kernel';

describe('The default Reporter', () => {
  it('creates an Error with a minimal message upon request', () => {
    const code = 42;
    const error = Reporter.error(code);
    expect(error.message).to.equal(`Code ${code}`);
  });
});
