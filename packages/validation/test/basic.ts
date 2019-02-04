import { StageComponent, ComponentTester } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { RegistrationForm } from './resources/registration-form';
import { validateTrigger, ValidateEvent } from '../src/aurelia-validation';
import { configure, blur, change } from './shared';

describe('end to end', () => {
  it('basic scenarios', (done: () => void) => {
    const component: ComponentTester = StageComponent
      .withResources()
      .inView('<registration-form></registration-form>')
      .boundTo({});
    component.bootstrap(configure);

    let firstName: HTMLInputElement;
    let lastName: HTMLInputElement;
    let number1: HTMLInputElement;
    let number2: HTMLInputElement;
    // let password: HTMLInputElement;
    let confirmPassword: HTMLInputElement;

    let viewModel: RegistrationForm;

    const renderer = { render: jasmine.createSpy() };

    component.create(bootstrap as any)
      // grab some references.
      .then(() => {
        viewModel = component.viewModel;
        viewModel.controller.addRenderer(renderer);
        firstName = component.element.querySelector('#firstName') as HTMLInputElement;
        lastName = component.element.querySelector('#lastName') as HTMLInputElement;
        number1 = component.element.querySelector('#number1') as HTMLInputElement;
        number2 = component.element.querySelector('#number2') as HTMLInputElement;
        // password = component.element.querySelector('#password') as HTMLInputElement;
        confirmPassword = component.element.querySelector('#confirmPassword') as HTMLInputElement;
      })
      // initially there should not be any errors
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // blur the firstName field- this should trigger validation.
      .then(() => blur(firstName))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      // make a model change to the firstName field.
      // this should reset the errors for the firstName field.
      .then(() => viewModel.firstName = 'test')
      // confirm the errors were reset.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // blur the lastName field- this should trigger validation.
      .then(() => blur(lastName))
      // confirm there's an error.
      .then(() => {
        expect(viewModel.controller.errors.length).toBe(1);
        const calls = renderer.render.calls;
        const renderInstruction = calls.argsFor(calls.count() - 1)[0];
        expect(renderInstruction.render[0].elements[0]).toBe(lastName);
      })
      // blur the number1 field- this should trigger validation.
      .then(() => blur(number1))
      // confirm there's an error.
      .then(() => {
        expect(viewModel.controller.errors.length).toBe(2);
        const calls = renderer.render.calls;
        const renderInstruction = calls.argsFor(calls.count() - 1)[0];
        expect(renderInstruction.render[0].elements[0]).toBe(number1);
      })
      // blur the number2 field- this should trigger validation.
      .then(() => blur(number2))
      // confirm there's an error.
      .then(() => {
        expect(viewModel.controller.errors.length).toBe(3);
        const calls = renderer.render.calls;
        const renderInstruction = calls.argsFor(calls.count() - 1)[0];
        expect(renderInstruction.render[0].elements[0]).toBe(number2);
      })
      // make a model change to the number1 field.
      // this should reset the errors for the number1 field.
      .then(() => viewModel.number1 = 1)
      // confirm the error was reset.
      .then(() => expect(viewModel.controller.errors.length).toBe(2))
      // make a model change to the number2 field.
      // this should reset the errors for the number2 field.
      .then(() => viewModel.number2 = 2)
      // confirm the error was reset.
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      // change the numbers back to invalid values.
      .then(() => {
        viewModel.number1 = 0;
        viewModel.number2 = 0;
      })

      // hide the form and change the validateTrigger.
      .then(() => {
        viewModel.showForm = false;
        viewModel.controller.validateTrigger = validateTrigger.change;
      })
      // show the form
      .then(() => viewModel.showForm = true)
      // confirm hiding and showing the form reset the errors.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // change the firstName field- this should trigger validation.
      .then(() => change(firstName, 'test'))
      // confirm there's no error.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // change the firstName field- this should trigger validation.
      .then(() => change(firstName, ''))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      // change the number1 field- this should trigger validation.
      .then(() => change(number1, '-1'))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(2))
      // change the number2 field- this should trigger validation.
      .then(() => change(number2.firstElementChild as HTMLInputElement, '-1'))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(3))
      // change the number1 field- this should trigger validation.
      .then(() => change(number1, '32'))
      // confirm the error was reset.
      .then(() => expect(viewModel.controller.errors.length).toBe(2))
      // change the number2 field- this should trigger validation.
      .then(() => change(number2.firstElementChild as HTMLInputElement, '23'))
      // confirm the error was reset.
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      // change the numbers back to invalid values.
      .then(() => {
        viewModel.number1 = 0;
        viewModel.number2 = 0;
        viewModel.password = 'a';
        viewModel.confirmPassword = 'a';
        viewModel.controller.reset();
      })
      // make the passwords mismatch.
      .then(() => change(confirmPassword, 'b'))
      // confirm the custom validator worked
      .then(() => expect(viewModel.controller.errors[0].message).toBe('Confirm Password must match Password'))

      // hide the form and change the validateTrigger.
      .then(() => {
        viewModel.showForm = false;
        viewModel.controller.validateTrigger = validateTrigger.manual;
      })
      // show the form
      .then(() => viewModel.showForm = true)
      // confirm hiding and showing the form reset the errors.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // validate all bindings
      .then(() => viewModel.controller.validate())
      // confirm validating resulted in errors.
      .then(() => expect(viewModel.controller.errors.length).toBe(6))
      // reset all bindings
      .then(() => viewModel.controller.reset())
      // confirm resetting cleared all errors.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))

      // hide the form and change the validateTrigger.
      .then(() => {
        viewModel.showForm = false;
        viewModel.controller.validateTrigger = validateTrigger.changeOrBlur;
      })
      // show the form
      .then(() => viewModel.showForm = true)
      // confirm hiding and showing the form reset the errors.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // blur the firstName field- this should trigger validation.
      .then(() => blur(firstName))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      // make a model change to the firstName field.
      // this should reset the errors for the firstName field.
      .then(() => viewModel.firstName = 'test')
      // confirm the errors were reset.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // change the lastName field- this should trigger validation.
      .then(() => change(lastName, 'abcdef'))
      .then(() => change(lastName, ''))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      // make lastName valid again
      .then(() => change(lastName, 'ghi'))
      // confirm there's an error.
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      // add some errors
      .then(() => {
        const error1 = viewModel.controller.addError('object error', viewModel);
        expect(error1.message).toBe('object error');
        expect(error1.object).toBe(viewModel);
        expect(error1.propertyName).toBe(null);
        const error2 = viewModel.controller.addError('string property error', viewModel, 'lastName');
        expect(error2.message).toBe('string property error');
        expect(error2.object).toBe(viewModel);
        expect(error2.propertyName).toBe('lastName');
        const error3 = viewModel.controller.addError('expression property error', viewModel, vm => vm.firstName);
        expect(error3.message).toBe('expression property error');
        expect(error3.object).toBe(viewModel);
        expect(error3.propertyName).toBe('firstName');

        expect(viewModel.controller.errors.length).toBe(3);

        viewModel.controller.removeError(error1);
        expect(viewModel.controller.errors.length).toBe(2);

        viewModel.controller.removeError(error2);
        expect(viewModel.controller.errors.length).toBe(1);

        viewModel.controller.removeError(error3);
        expect(viewModel.controller.errors.length).toBe(0);
      })
      // subscribe to error events
      .then(() => {
        let event1: ValidateEvent;
        let event2: ValidateEvent;
        const spy1 = jasmine.createSpy().and.callFake((event: ValidateEvent) => event1 = event);
        const spy2 = jasmine.createSpy().and.callFake((event: ValidateEvent) => event2 = event);
        viewModel.controller.subscribe(spy1);
        viewModel.controller.subscribe(spy2);
        return change(lastName, '')
          .then(() => {
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(event1).toBe(event2);
            expect(event1.errors.length).toBe(1);
            spy1.calls.reset();
            spy2.calls.reset();
            event1 = null as any;
            event2 = null as any;
          })
          .then(() => change(firstName, ''))
          .then(() => {
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(event1).toBe(event2);
            expect(event1.errors.length).toBe(2);
          });
      })

      // cleanup and finish.
      .then(() => component.dispose())
      .then(done);
  });
});
