import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { customElement, CustomElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController, ValidationController, ValidationHtmlConfiguration } from '@aurelia/validation-html';

describe('validation-html/validation-scoped-controller-dispose.spec.ts', function () {
  class Person {
    public name = '';
  }

  it('keeps the scoped validation controller for repeat rows created after a removal', async function () {
    @customElement({
      name: 'people-form',
      template: `<div repeat.for="p of people"><input value.bind="p.name & validate"></div>`,
    })
    class PeopleForm {
      public readonly controller = resolve(newInstanceForScope(IValidationController)) as ValidationController;
      public readonly validationRules = resolve(IValidationRules);
      public people: Person[] = [new Person(), new Person()];
      public constructor() {
        for (const person of this.people) {
          this.validationRules.on(person).ensure('name').required();
        }
      }
      public addPerson(): Person {
        const person = new Person();
        this.validationRules.on(person).ensure('name').required();
        this.people.push(person);
        return person;
      }
    }

    const fixture = createFixture('<people-form></people-form>', class App { }, [ValidationHtmlConfiguration, PeopleForm]);
    await fixture.started;
    const form = CustomElement.for(fixture.getBy('people-form')).viewModel as PeopleForm;
    const controller = form.controller;
    assert.strictEqual(controller.bindings.size, 2);

    form.people.pop();
    const added = form.addPerson();
    await tasksSettled();

    assert.strictEqual(controller.bindings.size, 2);
    const inputs = Array.from(fixture.appHost.querySelectorAll('input'));
    const boundTargets = Array.from(controller.bindings.keys()).map(binding => binding.target);
    for (const input of inputs) {
      assert.notStrictEqual(boundTargets.indexOf(input), -1, 'every live input should have a registered validate binding');
    }

    inputs[inputs.length - 1].dispatchEvent(new fixture.ctx.Event('focusout', { bubbles: true }));
    await tasksSettled();

    const result = controller.results.find(r => !r.valid && r.propertyName === 'name' && r.object === added);
    assert.notStrictEqual(result, void 0, 'an invalid result for the new person name should exist');
    await fixture.stop(true);
  });
});
