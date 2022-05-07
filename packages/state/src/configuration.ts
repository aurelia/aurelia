import { IContainer } from '@aurelia/kernel';
import { StateContainer } from './state';
import { StateAttributePattern, StateBindingCommand, StateBindingInstructionRenderer } from './state-templating';

export const StandardStateConfiguration = {
  register(c: IContainer) {
    return c.register(
      StateAttributePattern,
      StateBindingCommand,
      StateBindingInstructionRenderer,
      StateContainer,
    );
  }
};
