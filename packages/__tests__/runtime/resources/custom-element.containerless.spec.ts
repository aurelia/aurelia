import { expect } from 'chai';
import { containerless } from '@aurelia/runtime';

describe('@containerless', function () {
  it(`non-invocation`, function () {
    @containerless
    class Foo {}

    expect(Foo['containerless']).to.equal(true);
  });

  it(`invocation`, function () {
    @containerless()
    class Foo {}

    expect(Foo['containerless']).to.equal(true);
  });
});
