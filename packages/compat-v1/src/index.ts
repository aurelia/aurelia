import { IContainer, IRegistry } from '@aurelia/kernel';
import { defineAstMethods } from './compat-ast';
import { PreventFormActionlessSubmit } from './compat-form';

const registration: IRegistry = {
  register(container: IContainer) {
    defineAstMethods();
    container.register(PreventFormActionlessSubmit);
  }
};

export {
  PreventFormActionlessSubmit,
};

export default registration;
