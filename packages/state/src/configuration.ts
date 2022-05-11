import { IContainer, Registration } from '@aurelia/kernel';
import { Action, type IReducerAction } from './reducer';
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

export type INamedReducerActionRegistration<T> = { target: string; action: IReducerAction<T> };

const createConfiguration = <T extends object>(initialState: T, reducers: INamedReducerActionRegistration<T>[]) => {
  return {
    register: (c: IContainer) => c.register(
      ...standardRegistrations,
      Registration.instance(IState, initialState),
      ...reducers.map(r => Action.isType(r) ? r : Action.define(r.target, r.action as unknown as IReducerAction<object>))
    ),
    init: <T1 extends object>(state: T1, ...reducers: INamedReducerActionRegistration<T1>[]) => createConfiguration(state, reducers),
  };
};

export const StandardStateConfiguration = createConfiguration({}, []);
