import { containerless } from '../../src/index';
import { expect } from 'chai';

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
