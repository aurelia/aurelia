/// <reference types="chai" />

namespace Chai {
  interface Assertion {
    $state: Chai.StateAssertion;
  }

  interface StateAssertion {
    none(msg?: string): Chai.Assertion & StateAssertion;
    isBinding(msg?: string): Chai.Assertion & StateAssertion;
    isBound(msg?: string): Chai.Assertion & StateAssertion;
    isAttaching(msg?: string): Chai.Assertion & StateAssertion;
    isAttached(msg?: string): Chai.Assertion & StateAssertion;
    isMounted(msg?: string): Chai.Assertion & StateAssertion;
    isDetaching(msg?: string): Chai.Assertion & StateAssertion;
    isUnbinding(msg?: string): Chai.Assertion & StateAssertion;
    isCached(msg?: string): Chai.Assertion & StateAssertion;
  }
}
