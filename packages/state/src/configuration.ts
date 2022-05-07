import { IContainer, Registration } from '@aurelia/kernel';
import { IState, StateContainer } from './state';
import { StateAttributePattern, StateBindingCommand, StateBindingInstructionRenderer } from './state-templating';

const standardRegistrations = [
  StateAttributePattern,
  StateBindingCommand,
  StateBindingInstructionRenderer,
  StateContainer,
];

const createConfiguration = (initialState: object) => {
  return {
    register: (c: IContainer) => c.register(...standardRegistrations, Registration.instance(IState, initialState)),
    init: (state: object) => createConfiguration(state),
  };
};

export const StandardStateConfiguration = createConfiguration({});
