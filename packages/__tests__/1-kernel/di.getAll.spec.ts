// import { Metadata } from '@aurelia/metadata';
import { all, DI, IContainer, Registration } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('1-kernel/di.getAll.spec.ts', function () {
  let container: IContainer;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    container = DI.createContainer();
  });

  describe('good', function () {
    // eslint-disable
    for (const searchAncestors of [true, false])
    for (const regInChild of [true, false])
    for (const regInParent of [true, false]) {
      // eslint-enable
      it(`@all(_, ${searchAncestors}) + [child ${regInChild}] + [parent ${regInParent}]`, function () {
        class Foo {
          public constructor(@all('test', searchAncestors) public readonly test: string[]) {}
        }
        const child = container.createChild();
        if (regInParent) {
          container.register(Registration.instance('test', 'test1'));
        }
        if (regInChild) {
          child.register(Registration.instance('test', 'test0'));
        }
        const expectation: string[] = regInChild ? ['test0'] : [];
        if (regInParent && (searchAncestors || !regInChild)) {
          expectation.push('test1');
        }
        assert.deepStrictEqual(child.get(Foo).test, expectation)
      });
    }
  });
});
