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

const createConfiguration = <T>(initialState: T, actionHandlers: IActionHandler<T>[]) => {
  return {
    register: (c: IContainer) => {
      c.register(
        Registration.instance(IState, initialState),
        ...standardRegistrations,
        ...actionHandlers.map(ActionHandler.define),
      );
    },
    init: <T1>(state: T1, ...actionHandlers: IActionHandler<T1>[]) => createConfiguration(state, actionHandlers),
  };
};

export const StateDefaultConfiguration = createConfiguration({}, []);
