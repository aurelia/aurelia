import { expect } from 'chai';
import { DI, RuntimeCompilationResources } from '@aurelia/kernel';

describe('RuntimeCompilationResources', function () {

  it('does not register while finding resource', function () {
    const container = DI.createContainer();
    const resources = new RuntimeCompilationResources(container as any);

    const res = { keyFrom(name: string): string {
      return name;
    } } as any;
    resources.find(res, 'a');
    expect(container.getResolver(res.keyFrom('a'), false)).to.equal(null);
  });
});
