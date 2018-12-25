import { containerless } from '../../src/index';
import { expect } from 'chai';

describe('@containerless', () => {
  it(`non-invocation`, () => {
    @containerless
    class Foo {}

    expect(Foo['containerless']).to.be.true;
  });

  it(`invocation`, () => {
    @containerless()
    class Foo {}

    expect(Foo['containerless']).to.be.true;
  });
});
