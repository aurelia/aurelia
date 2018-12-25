import { RuntimeCompilationResources, Container } from '../../src/index'
import { expect } from 'chai';

describe('RuntimeCompilationResources', () => {

  it('does not register while finding resource', () => {
    const container = new Container();
    const resources = new RuntimeCompilationResources(container as any);

    const res = <any>{ keyFrom(name: string): string { return name; } };
    resources.find(res, 'a');
    expect(container.getResolver(res.keyFrom('a'), false)).to.be.null;
  });
});
