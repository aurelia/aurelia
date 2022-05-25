import { IContainer, Registration } from '@aurelia/kernel';
import { IActionHandler, IState } from './interfaces';
import { ActionHandler } from './action-handler';
import { Store } from './store';
import { StateBindingBehavior } from './state-binding-behavior';
import {
  DispatchAttributePattern,
  DispatchBindingCommand,
  DispatchBindingInstructionRenderer,
  StateAttributePattern,
  StateBindingCommand,
  StateBindingInstructionRenderer,
} from './state-templating';

const standardRegistrations = [
  StateAttributePattern,
  StateBindingCommand,
  StateBindingInstructionRenderer,

  DispatchAttributePattern,
  DispatchBindingCommand,
  DispatchBindingInstructionRenderer,

  StateBindingBehavior,

  Store,
];

const createConfiguration = <T>(initialState: T, reducers: IActionHandler<T>[]) => {
  return {
    register: (c: IContainer) => {
      c.register(
        Registration.instance(IState, initialState),
        ...standardRegistrations,
        ...reducers.map(ActionHandler.define),
      );
    },
    init: <T1>(state: T1, ...reducers: IActionHandler<T1>[]) => createConfiguration(state, reducers),
  };
};

export const StateDefaultConfiguration = createConfiguration({}, []);
