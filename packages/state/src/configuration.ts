import { IContainer, Registration } from '@aurelia/kernel';
import { IReducerAction, IState } from './interfaces';
import { Action } from './reducer';
import { StateContainer } from './state';
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

export type INamedReducerActionRegistration<T> = [target: string, action: IReducerAction<T>];

const createConfiguration = <T>(initialState: T, reducers: (IReducerAction<T> | INamedReducerActionRegistration<T>)[]) => {
  return {
    register: (c: IContainer) => {
      c.register(
        ...standardRegistrations,
        Registration.instance(IState, initialState),
        ...reducers.map(r => typeof r === 'function' ? Action.define(r) : Action.define(r[0], r[1])),
      );
    },
    init: <T1>(state: T1, ...reducers: INamedReducerActionRegistration<T1>[]) => createConfiguration(state, reducers),
  };
};

export const StandardStateConfiguration = createConfiguration({}, []);
