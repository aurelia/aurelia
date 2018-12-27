import { expect } from 'chai';
import { Container, RuntimeCompilationResources } from '../src/index'

describe('RuntimeCompilationResources', () => {

  it('does not register while finding resource', () => {
    const container = new Container();
    const resources = new RuntimeCompilationResources(container as any);

    const res = { keyFrom(name: string): string { return name; } } as any;
    resources.find(res, 'a');
    expect(container.getResolver(res.keyFrom('a'), false)).to.equal(null);
  });
});
