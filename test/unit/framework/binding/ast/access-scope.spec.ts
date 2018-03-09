import { AccessScope } from '../../../../../src/framework/binding/ast';
import { createOverrideContext, createScopeForTest } from '../../../../../src/framework/binding/scope';

describe('AccessScope', () => {
  let foo, $parentfoo, binding;

  beforeAll(() => {
    foo = new AccessScope('foo', 0);
    $parentfoo = new AccessScope('foo', 1);
    binding = { observeProperty: jasmine.createSpy('observeProperty') };
  });

  it('evaluates undefined bindingContext', () => {
    let scope = { overrideContext: createOverrideContext(undefined) };
    expect(foo.evaluate(scope, null)).toBe(undefined);
  });

  it('assigns undefined bindingContext', () => {
    let scope = { overrideContext: createOverrideContext(undefined) };
    foo.assign(scope, 'baz');
    expect((scope.overrideContext as any).foo).toBe('baz');
  });

  it('connects undefined bindingContext', () => {
    let scope = { overrideContext: createOverrideContext(undefined) };
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(scope.overrideContext, 'foo');
  });

  it('evaluates null bindingContext', () => {
    let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
    expect(foo.evaluate(scope, null)).toBe(undefined);
  });

  it('assigns null bindingContext', () => {
    let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
    foo.assign(scope, 'baz');
    expect((scope.overrideContext as any).foo).toBe('baz');
  });

  it('connects null bindingContext', () => {
    let scope = { overrideContext: createOverrideContext(null), bindingContext: null };
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(scope.overrideContext, 'foo');
  });

  it('evaluates defined property on bindingContext', () => {
    let scope = createScopeForTest({ foo: 'bar' });
    expect(foo.evaluate(scope, null)).toBe('bar');
  });

  it('evaluates defined property on overrideContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' });
    (scope.overrideContext as any).foo = 'bar';
    expect(foo.evaluate(scope, null)).toBe('bar');
  });

  it('assigns defined property on bindingContext', () => {
    let scope = createScopeForTest({ foo: 'bar' });
    foo.assign(scope, 'baz');
    expect(scope.bindingContext.foo).toBe('baz');
  });

  it('assigns undefined property to bindingContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' });
    foo.assign(scope, 'baz');
    expect(scope.bindingContext.foo).toBe('baz');
  });

  it('assigns defined property on overrideContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' });
    (scope.overrideContext as any).foo = 'bar';
    foo.assign(scope, 'baz');
    expect((scope.overrideContext as any).foo).toBe('baz');
  });

  it('connects defined property on bindingContext', () => {
    let scope = createScopeForTest({ foo: 'bar' });
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(scope.bindingContext, 'foo');
  });

  it('connects defined property on overrideContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' });
    (scope.overrideContext as any).foo = 'bar';
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(scope.overrideContext, 'foo');
  });

  it('connects undefined property on bindingContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' });
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(scope.bindingContext, 'foo');
  });

  it('evaluates defined property on first ancestor bindingContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    expect(foo.evaluate(scope, null)).toBe('bar');
    expect($parentfoo.evaluate(scope, null)).toBe('bar');
  });

  it('evaluates defined property on first ancestor overrideContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    ((scope.overrideContext as any).parentOverrideContext as any).foo = 'bar';
    expect(foo.evaluate(scope, null)).toBe('bar');
    expect($parentfoo.evaluate(scope, null)).toBe('bar');
  });

  it('assigns defined property on first ancestor bindingContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    foo.assign(scope, 'baz');
    expect(((scope.overrideContext as any).parentOverrideContext as any).bindingContext.foo).toBe('baz');
    $parentfoo.assign(scope, 'beep');
    expect(((scope.overrideContext as any).parentOverrideContext as any).bindingContext.foo).toBe('beep');
  });

  it('assigns defined property on first ancestor overrideContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    ((scope.overrideContext as any).parentOverrideContext as any).foo = 'bar';
    foo.assign(scope, 'baz');
    expect(((scope.overrideContext as any).parentOverrideContext as any).foo).toBe('baz');
    $parentfoo.assign(scope, 'beep');
    expect(((scope.overrideContext as any).parentOverrideContext as any).foo).toBe('beep');
  });

  it('connects defined property on first ancestor bindingContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, { foo: 'bar' });
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(
      ((scope.overrideContext as any).parentOverrideContext as any).bindingContext,
      'foo'
    );
    binding.observeProperty.calls.reset();
    $parentfoo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(
      ((scope.overrideContext as any).parentOverrideContext as any).bindingContext,
      'foo'
    );
  });

  it('connects defined property on first ancestor overrideContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, { def: 'rsw' });
    ((scope.overrideContext as any).parentOverrideContext as any).foo = 'bar';
    binding.observeProperty.calls.reset();
    foo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith((scope.overrideContext as any).parentOverrideContext, 'foo');
    binding.observeProperty.calls.reset();
    $parentfoo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith((scope.overrideContext as any).parentOverrideContext, 'foo');
  });

  it('connects undefined property on first ancestor bindingContext', () => {
    let scope = createScopeForTest({ abc: 'xyz' }, {});
    ((scope.overrideContext as any).parentOverrideContext as any).parentOverrideContext = createOverrideContext({ foo: 'bar' });
    binding.observeProperty.calls.reset();
    $parentfoo.connect(binding, scope);
    expect(binding.observeProperty).toHaveBeenCalledWith(
      ((scope.overrideContext as any).parentOverrideContext as any).bindingContext,
      'foo'
    );
  });
});
