import { useShadowDOM } from '../../../src';
import { expect } from 'chai';

describe('@useShadowDOM', () => {
  it(`non-invocation`, () => {
    @useShadowDOM
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation without options`, () => {
    @useShadowDOM()
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=open`, () => {
    @useShadowDOM({ mode: 'open' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('open');
  });

  it(`invocation with options mode=closed`, () => {
    @useShadowDOM({ mode: 'closed' })
    class Foo {}

    expect(Foo['shadowOptions'].mode).to.equal('closed');
  });
});
