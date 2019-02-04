import { StageComponent, ComponentTester } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { configure, blur } from './shared';
import {
  ValidationControllerFactory
} from '../src/aurelia-validation';
import { Container } from 'aurelia-dependency-injection';
import { Aurelia } from 'aurelia-framework';

describe('ValidationErrorsCustomAttribute', () => {

  let component: ComponentTester;
  let viewModel: any;
  const parentViewModel = { form: '', controller: () => null, theController: null };
  let container: Container;

  const stageTest = (validationErrors: string, supplyControllerToViewModel?: boolean) => {
    const form: string = `
      <template>
        <form novalidate autocomplete='off' ${validationErrors}>
          <input ref='standardInput' type='text' value.bind='standardProp & validateOnBlur'>
        </form>
      </template>`;

    parentViewModel.form = form;

    component = StageComponent
      .withResources()
      // tslint:disable-next-line:max-line-length
      .inView(`<compose containerless view-model="./dist/test/test/resources/validation-errors-form-one" model.bind="{ form: form, controller: controller }"></compose>`)
      // tslint:enable-next-line:max-line-length
      .boundTo(parentViewModel);

    const myConfigure = (aurelia: Aurelia) => {
      const config = configure(aurelia);
      container = aurelia.container;
      return config;
    };

    component.bootstrap(myConfigure);

    /*
      at this point validation plugin has not yet been initialized, not until in component.create()
    */
    if (supplyControllerToViewModel) {
      /*
        the viewmodel is going to call this in created().
        at that point the validation plugin will have been initialized and bind() will
        not yet have been executed.
      */
      parentViewModel.controller = () => {
        const factory = container.get(ValidationControllerFactory);
        const controller = factory.createForCurrentScope();
        parentViewModel.theController = controller;
        return controller;
      };
    }

    return component.create(bootstrap as any)
      .then(() => {
        // we get here after the viewmodel's bind().
        viewModel = component.viewModel.currentViewModel;
      });
  };

  it('sets errors given as default property', (done: () => void) => {

    stageTest(`validation-errors.bind='myErrors'`)
      .then(() => expect(viewModel).not.toBeNull())
      .then(() => expect(viewModel.myErrors instanceof Array).toBe(true))
      .then(() => expect(viewModel.myErrors.length).toBe(0))
      .then(() => {
        blur(viewModel.standardInput);
        return new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 0); });
      })
      .then(() => expect(viewModel.myErrors.length).toBe(1))
      .then(done)
      /* tslint:disable:no-console */
      .catch(e => { console.log(e.toString()); done(); });
    /* tslint:enable:no-console */
  });

  it('sets errors given as named property', (done: () => void) => {

    stageTest(`validation-errors='errors.bind:myErrors'`)
      .then(() => expect(viewModel).not.toBeNull())
      .then(() => expect(viewModel.myErrors instanceof Array).toBe(true))
      .then(() => expect(viewModel.myErrors.length).toBe(0))
      .then(() => {
        blur(viewModel.standardInput);
        return new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 0); });
      })
      .then(() => expect(viewModel.myErrors.length).toBe(1))
      .then(done)
      /* tslint:disable:no-console */
      .catch(e => { console.log(e.toString()); done(); });
    /* tslint:enable:no-console */
  });

  it('uses given controller', (done: () => void) => {

    stageTest(`validation-errors='errors.bind:myErrors;controller.bind:controller'`, true)
      .then(() => expect(viewModel).not.toBeNull())
      .then(() => expect(parentViewModel.controller).not.toBeNull())
      .then(() => expect(viewModel.myErrors instanceof Array).toBe(true))
      .then(() => expect(viewModel.myErrors.length).toBe(0))
      .then(() => {
        blur(viewModel.standardInput);
        return new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 0); });
      })
      .then(() => expect(viewModel.myErrors.length).toBe(1))
      // this shows that myErrors is being written from the controller that we gave to validation-errors
      .then(() => expect(viewModel.myErrors[0].error).toEqual((parentViewModel as any).theController.errors[0]))
      .then(done)
      // tslint:disable-next-line:no-console
      .catch(e => { console.log(e.toString()); done(); });
  });

  it('does nothing when given only a controller', (done: () => void) => {

    stageTest(`validation-errors='controller.bind:controller'`, true)
      .then(() => expect(viewModel).not.toBeNull())
      .then(() => expect(parentViewModel.controller).not.toBeNull())
      .then(() => expect(viewModel.myErrors).toBeUndefined())
      .then(() => {
        blur(viewModel.standardInput);
        return new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 0); });
      })
      .then(() => expect(viewModel.myErrors).toBeUndefined())
      .then(done)
      // tslint:disable-next-line:no-console
      .catch(e => { console.log(e.toString()); done(); });
  });

  it('does nothing when given nothing', (done: () => void) => {

    stageTest(`validation-errors=''`, true)
      .then(() => expect(viewModel).not.toBeNull())
      .then(() => expect(parentViewModel.controller).not.toBeNull())
      .then(() => expect(viewModel.myErrors).toBeUndefined())
      .then(() => {
        blur(viewModel.standardInput);
        return new Promise<void>((resolve) => { setTimeout(() => { resolve(); }, 0); });
      })
      .then(() => expect(viewModel.myErrors).toBeUndefined())
      .then(done)
      // tslint:disable-next-line:no-console
      .catch(e => { console.log(e.toString()); done(); });
  });

  afterEach(() => {
    if (component) {
      component.dispose();
    }
  });
});
