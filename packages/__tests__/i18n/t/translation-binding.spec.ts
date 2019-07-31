// tslint:disable: no-object-literal-type-assertion
import { I18nConfiguration, TranslationBinding } from '@aurelia/i18n';
import { DI } from '@aurelia/kernel';
import { BindingType, ensureExpression, IBindingTargetAccessor, IExpressionParser, IObserverLocator, IScope, LifecycleFlags, RuntimeBasicConfiguration } from '@aurelia/runtime';
import { DOM } from '@aurelia/runtime-html';
import { assert, createSpy } from '@aurelia/testing';

describe.only('TranslationBinding', function () {
  async function setup(rawExpr: string, target: HTMLElement, parseExpr = false) {
    const translation = {
      simple: {
        text: 'simple text',
        attr: 'simple attribute'
      }
    };
    const container = DI.createContainer();
    container.register(RuntimeBasicConfiguration);
    container.register(I18nConfiguration.customize(() => ({ resources: { en: { translation } } })));

    const targetAccessor: IBindingTargetAccessor = { setValue() { /* noop */ } } as unknown as IBindingTargetAccessor;
    const observerLocator: IObserverLocator = {
      getAccessor() { return targetAccessor; }
    } as unknown as IObserverLocator;
    const getAccessorSpy = createSpy(observerLocator, 'getAccessor', true);
    const setValueSpy = createSpy(targetAccessor, 'setValue', true);

    const expr = parseExpr
      ? ensureExpression(container.get(IExpressionParser), rawExpr, BindingType.BindCommand)
      : rawExpr;
    const sut = new TranslationBinding(target, '', observerLocator, container);
    sut.expr = expr;
    await sut['i18n']['task'].wait();
    return { translation, getAccessorSpy, setValueSpy, sut };
  }

  it('$bind works for string literal expression as key', async function () {
    const target = DOM.createElement('span');
    const { translation, getAccessorSpy, setValueSpy, sut } = await setup('simple.text', target);

    sut.$bind(LifecycleFlags.none, {} as IScope, '');

    assert.equal(getAccessorSpy.calls.length, 1);
    assert.deepEqual(getAccessorSpy.calls[0], [LifecycleFlags.none, target, 'textContent']);

    assert.equal(setValueSpy.calls.length, 1);
    assert.deepEqual(setValueSpy.calls[0], [translation.simple.text, LifecycleFlags.none]);
  });

  it('$bind works for member access expression as key', async function () {
    const target = DOM.createElement('span');
    const { translation, getAccessorSpy, setValueSpy, sut } = await setup('obj.key', target, true);

    sut.$bind(LifecycleFlags.none, { bindingContext: { obj: { key: 'simple.text' } } } as unknown as IScope, '');

    assert.equal(getAccessorSpy.calls.length, 1);
    assert.deepEqual(getAccessorSpy.calls[0], [LifecycleFlags.none, target, 'textContent']);

    assert.equal(setValueSpy.calls.length, 1);
    assert.deepEqual(setValueSpy.calls[0], [translation.simple.text, LifecycleFlags.none]);
  });

  it('$bind works for multiple targets', async function () {
    const target = DOM.createElement('span');
    const { translation, getAccessorSpy, setValueSpy, sut } = await setup('simple.text;[title]simple.attr', target);

    sut.$bind(LifecycleFlags.none, {} as IScope, '');

    assert.equal(getAccessorSpy.calls.length, 2);
    assert.deepEqual(getAccessorSpy.calls[0], [LifecycleFlags.none, target, 'textContent']);
    assert.deepEqual(getAccessorSpy.calls[1], [LifecycleFlags.none, target, 'title']);

    assert.equal(setValueSpy.calls.length, 2);
    assert.deepEqual(setValueSpy.calls[0], [translation.simple.text, LifecycleFlags.none]);
    assert.deepEqual(setValueSpy.calls[1], [translation.simple.attr, LifecycleFlags.none]);
  });

  it('$bind img src by default', async function () {
    const target = DOM.createElement('img');
    const { translation, getAccessorSpy, setValueSpy, sut } = await setup('simple.text', target);

    sut.$bind(LifecycleFlags.none, {} as IScope, '');

    assert.equal(getAccessorSpy.calls.length, 1);
    assert.deepEqual(getAccessorSpy.calls[0], [LifecycleFlags.none, target, 'src']);

    assert.equal(setValueSpy.calls.length, 1);
    assert.deepEqual(setValueSpy.calls[0], [translation.simple.text, LifecycleFlags.none]);
  });
});
