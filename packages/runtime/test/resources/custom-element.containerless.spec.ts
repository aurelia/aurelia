import { expect } from 'chai';
import { containerless } from '../../src/index';

describe('@containerless', () => {
  it(`non-invocation`, () => {
    @containerless
    class Foo {}

    expect(Foo['containerless']).to.equal(true);
  });

  it(`invocation`, () => {
    @containerless()
    class Foo {}

    expect(Foo['containerless']).to.equal(true);
  });
});
