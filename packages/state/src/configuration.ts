import { IContainer, Registration } from '@aurelia/kernel';
import { IReducer, IState } from './interfaces';
import { Reducer } from './reducer';
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

  Store,
];

export type INamedReducerActionRegistration<T> = [target: string, action: IReducer<T>];

const createConfiguration = <T>(initialState: T, reducers: IReducer<T>[]) => {
  return {
    register: (c: IContainer) => {
      c.register(
        ...standardRegistrations,
        Registration.instance(IState, initialState),
        StateBindingBehavior,
        ...reducers.map(r => typeof r === 'function' ? Reducer.define(r) : Reducer.define(r[0], r[1])),
      );
    },
    init: <T1>(state: T1, ...reducers: IReducer<T1>[]) => createConfiguration(state, reducers),
  };
};

export const StateDefaultConfiguration = createConfiguration({}, []);
