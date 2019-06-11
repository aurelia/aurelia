import { DI, RuntimeCompilationResources } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('RuntimeCompilationResources', function () {

  it('does not register while finding resource', function () {
    const container = DI.createContainer();
    const resources = new RuntimeCompilationResources(container as any);

    const res = { keyFrom(name: string): string {
      return name;
    } } as any;
    resources.find(res, 'a');
    assert.strictEqual(container.getResolver(res.keyFrom('a'), false), null, `container.getResolver(res.keyFrom('a'), false)`);
  });
});
