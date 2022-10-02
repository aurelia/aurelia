import { IContainer, IRegistry } from '@aurelia/kernel';
import { defineAstMethods } from './compat-ast';
import { defineBindingMethods } from './compat-binding';
import { PreventFormActionlessSubmit } from './compat-form';
import { delegateRegistration } from './compat.delegate';

const compatRegistration: IRegistry = {
  register(container: IContainer) {
    defineAstMethods();
    defineBindingMethods();
    container.register(PreventFormActionlessSubmit);
    delegateRegistration.register(container);
  }
};

export {
  PreventFormActionlessSubmit,
};

export {
  compatRegistration,
  delegateRegistration
};
