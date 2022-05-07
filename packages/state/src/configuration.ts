import { IContainer, Registration } from '@aurelia/kernel';
import { Reducer, type IReducer } from './reducer';
import { IState, StateContainer } from './state';
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

  StateContainer,
];

const createConfiguration = (initialState: object, reducers: IReducer[]) => {
  return {
    register: (c: IContainer) => c.register(
      ...standardRegistrations,
      Registration.instance(IState, initialState),
      ...reducers.map(r => Reducer.isType(r) ? r : Reducer.define(r))
    ),
    init: (state: object, ...reducers: IReducer[]) => createConfiguration(state, reducers),
  };
};

export const StandardStateConfiguration = createConfiguration({}, []);
