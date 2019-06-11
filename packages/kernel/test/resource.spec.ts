import { expect } from 'chai';
import { Container } from '../src/di';
import { RuntimeCompilationResources } from '../src/index';

describe('RuntimeCompilationResources', function () {

  it('does not register while finding resource', function () {
    const container = new Container();
    const resources = new RuntimeCompilationResources(container as any);

    const res = { keyFrom(name: string): string {
      return name;
    } } as any;
    resources.find(res, 'a');
    expect(container.getResolver(res.keyFrom('a'), false)).to.equal(null);
  });
});
