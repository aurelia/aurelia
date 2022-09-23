import { IContainer, IRegistry } from '@aurelia/kernel';
import { PreventFormActionlessSubmit } from './compat-form';

const registration: IRegistry = {
  register(container: IContainer) {
    container.register(PreventFormActionlessSubmit);
  }
};

export {
  PreventFormActionlessSubmit,
};

export default registration;
