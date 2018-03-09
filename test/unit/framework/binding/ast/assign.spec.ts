import { Assign, AccessScope } from '../../../../../src/framework/binding/ast';
import { createOverrideContext, createScopeForTest } from '../../../../../src/framework/binding/scope';

describe('Assign', () => {
  it('can chain assignments', () => {
    const foo = new Assign(new AccessScope('foo'), new AccessScope('bar'));
    const scope = { overrideContext: createOverrideContext(undefined) };
    foo.assign(scope as any, 1, undefined);
    expect((scope.overrideContext as any).foo).toBe(1);
    expect((scope.overrideContext as any).bar).toBe(1);
  });
});
