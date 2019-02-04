import { StageComponent, ComponentTester } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';
import { NullableObjectForm } from './resources/nullable-object-form';
import { configure, blur, change } from './shared';

describe('ValidationController', () => {
  it('handles bindings with null objects', (done: () => void) => {
    const component: ComponentTester = StageComponent
      .withResources()
      .inView('<nullable-object-form></nullable-object-form>')
      .boundTo({});
    component.bootstrap(configure);

    let viewModel: NullableObjectForm;

    const renderer = { render: jasmine.createSpy() };

    component.create(bootstrap as any)
      // grab some references.
      .then(() => {
        viewModel = component.viewModel;
        viewModel.controller.addRenderer(renderer);
      })
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      .then(() => blur(viewModel.input))
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      .then(() => change(viewModel.input, 'test'))
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      .then(() => blur(viewModel.input))
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      .then(() => viewModel._obj = null)
      .then(() => blur(viewModel.input))
      .then(() => expect(viewModel.obj).toBe(null))
      .then(() => expect(viewModel.controller.errors.length).toBe(0))
      .then(() => viewModel._obj = { prop: '' })
      .then(() => blur(viewModel.input))
      .then(() => expect(viewModel.controller.errors.length).toBe(1))
      .then(() => {
        viewModel._obj = null;
        // wait for dirty-checking...
        return new Promise(resolve => setTimeout(resolve, 500));
      })
      .then(() => expect(viewModel.controller.errors.length).toBe(0))

      // cleanup and finish.
      .then(() => component.dispose())
      .then(done);
  });
});
