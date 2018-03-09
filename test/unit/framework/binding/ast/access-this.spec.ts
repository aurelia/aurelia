import { AccessThis } from '../../../../../src/framework/binding/ast';
import { createOverrideContext, createScopeForTest } from '../../../../../src/framework/binding/scope';

describe('AccessThis', () => {
  let $parent, $parent$parent, $parent$parent$parent;

  beforeAll(() => {
    $parent = new AccessThis(1);
    $parent$parent = new AccessThis(2);
    $parent$parent$parent = new AccessThis(3);
  });

  it('evaluates undefined bindingContext', () => {
    let coc = createOverrideContext;

    let scope = { overrideContext: coc(undefined) };
    expect($parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(undefined, coc(undefined)) };
    expect($parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined))) };
    expect($parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(undefined, coc(undefined, coc(undefined, coc(undefined)))) };
    expect($parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);
  });

  it('evaluates null bindingContext', () => {
    let coc = createOverrideContext;

    let scope = { overrideContext: coc(null) };
    expect($parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(null, coc(null)) };
    expect($parent.evaluate(scope, null)).toBe(null);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(null, coc(null, coc(null))) };
    expect($parent.evaluate(scope, null)).toBe(null);
    expect($parent$parent.evaluate(scope, null)).toBe(null);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(null, coc(null, coc(null, coc(null)))) };
    expect($parent.evaluate(scope, null)).toBe(null);
    expect($parent$parent.evaluate(scope, null)).toBe(null);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(null);
  });

  it('evaluates defined bindingContext', () => {
    let coc = createOverrideContext;
    let a = { a: 'a' };
    let b = { b: 'b' };
    let c = { c: 'c' };
    let d = { d: 'd' };
    let scope = { overrideContext: coc(a) };
    expect($parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(a, coc(b)) };
    expect($parent.evaluate(scope, null)).toBe(b);
    expect($parent$parent.evaluate(scope, null)).toBe(undefined);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(a, coc(b, coc(c))) };
    expect($parent.evaluate(scope, null)).toBe(b);
    expect($parent$parent.evaluate(scope, null)).toBe(c);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(undefined);

    scope = { overrideContext: coc(a, coc(b, coc(c, coc(d)))) };
    expect($parent.evaluate(scope, null)).toBe(b);
    expect($parent$parent.evaluate(scope, null)).toBe(c);
    expect($parent$parent$parent.evaluate(scope, null)).toBe(d);
  });
});
