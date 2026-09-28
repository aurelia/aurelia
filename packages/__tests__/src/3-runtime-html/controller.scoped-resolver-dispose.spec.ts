import { DI, IContainer, newInstanceForScope, resolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { CustomAttribute, CustomElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/controller.scoped-resolver-dispose.spec.ts', function () {
  class FormState { }
  const IFormState = DI.createInterface<FormState>('IFormState', x => x.transient(FormState));

  class FieldEl {
    public readonly state: FormState = resolve(IFormState);
  }
  const FieldElement = CustomElement.define({ name: 'field-el', template: 'f' }, FieldEl);

  function getFields(host: HTMLElement): FieldEl[] {
    return Array.from(host.querySelectorAll('field-el'))
      .map(el => CustomElement.for(el).viewModel as FieldEl);
  }

  function assertFieldsShareState(host: HTMLElement, owner: { state: FormState }, count: number): void {
    const fields = getFields(host);
    assert.strictEqual(fields.length, count, 'live field-el count');
    for (const field of fields) {
      assert.strictEqual(field.state, owner.state, 'field-el should resolve the owner-scoped instance');
    }
  }

  it('keeps the owner-scoped resolver when a repeat row is removed and another is added', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '<field-el repeat.for="i of items"></field-el>',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public items: number[] = [1, 2];
    });
    const fixture = createFixture('<my-form></my-form>', class App { }, [MyForm, FieldElement]);
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assertFieldsShareState(fixture.appHost, owner, 2);

    owner.items.pop();
    owner.items.push(3);
    await tasksSettled();

    assertFieldsShareState(fixture.appHost, owner, 2);
    await fixture.stop(true);
  });

  it('keeps the owner-scoped resolver when an uncached if view is re-created', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '<field-el if="value.bind: show; cache: false"></field-el>',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public show = true;
    });
    const fixture = createFixture('<my-form></my-form>', class App { }, [MyForm, FieldElement]);
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assertFieldsShareState(fixture.appHost, owner, 1);

    owner.show = false;
    await tasksSettled();
    owner.show = true;
    await tasksSettled();

    assertFieldsShareState(fixture.appHost, owner, 1);
    await fixture.stop(true);
  });

  it('keeps the owner-scoped resolver for siblings created after a repeat row removal', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '<field-el repeat.for="i of items"></field-el><field-el if.bind="show"></field-el>',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public items: number[] = [1, 2];
      public show = false;
    });
    const fixture = createFixture('<my-form></my-form>', class App { }, [MyForm, FieldElement]);
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assertFieldsShareState(fixture.appHost, owner, 2);

    owner.items.pop();
    await tasksSettled();
    owner.show = true;
    await tasksSettled();

    assertFieldsShareState(fixture.appHost, owner, 2);
    await fixture.stop(true);
  });

  it('still disposes the scoped registration when the owning element is disposed', async function () {
    const MyForm = CustomElement.define({
      name: 'my-form',
      template: '',
    }, class {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public readonly container: IContainer = resolve(IContainer);
    });
    const fixture = createFixture(
      '<my-form if="value.bind: show; cache: false"></my-form>',
      class App { public show = true; },
      [MyForm],
    );
    await fixture.started;
    const owner = CustomElement.for(fixture.getBy('my-form')).viewModel as InstanceType<typeof MyForm>;
    assert.strictEqual(owner.container.has(IFormState, false), true);

    fixture.component.show = false;
    await tasksSettled();

    assert.strictEqual(owner.container.has(IFormState, false), false);
    await fixture.stop(true);
  });

  it('still disposes the scoped registration when the owning custom attribute is disposed', async function () {
    class ScopedAttr {
      public readonly state: FormState = resolve(newInstanceForScope(IFormState));
      public readonly container: IContainer = resolve(IContainer);
    }
    const ScopedAttribute = CustomAttribute.define('scoped-attr', ScopedAttr);
    const fixture = createFixture(
      '<div scoped-attr if="value.bind: show; cache: false"></div>',
      class App { public show = true; },
      [ScopedAttribute],
    );
    await fixture.started;
    const host = fixture.getBy('div');
    const attr = CustomAttribute.for(host, 'scoped-attr').viewModel as ScopedAttr;
    assert.strictEqual(attr.container.has(IFormState, false), true);

    fixture.component.show = false;
    await tasksSettled();

    assert.strictEqual(attr.container.has(IFormState, false), false);
    await fixture.stop(true);
  });
});
