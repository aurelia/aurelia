import { IContainer, IRegistry } from '@aurelia/kernel';
import { defineAstMethods } from './compat-ast';
import { defineBindingMethods } from './compat-binding';
import { PreventFormActionlessSubmit } from './compat-form';

const registration: IRegistry = {
  register(container: IContainer) {
    defineAstMethods();
    defineBindingMethods();
    container.register(PreventFormActionlessSubmit);
  }
};

export {
  PreventFormActionlessSubmit,
};

export default registration;
