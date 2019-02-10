import { expect } from 'chai';
import { useShadowDOM } from '../../src/index';

describe('@useShadowDOM', function() {
  it(`non-invocation`, function() {
    @useShadowDOM
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation without options`, function() {
    @useShadowDOM()
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=open`, function() {
    @useShadowDOM({ mode: 'open' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=closed`, function() {
    @useShadowDOM({ mode: 'closed' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('closed');
  });
});
