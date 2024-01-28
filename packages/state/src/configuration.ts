import { IContainer, Registration } from '@aurelia/kernel';
import { IActionHandler, IState, IStore } from './interfaces';
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
import { IDevToolsOptions } from './interfaces-devtools';
import { AppTask } from '@aurelia/runtime-html';

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

const createConfiguration = <T>(
  initialState: T,
  actionHandlers: IActionHandler<T>[],
  options: IStateConfigurationOptions = {}
) => {
  return {
    register: (c: IContainer) => {
      c.register(
        Registration.instance(IState, initialState),
        ...standardRegistrations,
        ...actionHandlers.map(ActionHandler.define),
        /* istanbul ignore next */
        AppTask.creating(IStore, store => {
          if (options.devToolsOptions?.disable !== true) {
            store.connectDevTools(options.devToolsOptions ?? {});
          }
        })
      );
    },
    init: <T1>(state: T1, actionHandlers: IActionHandler<T1>[] = [], options: IStateConfigurationOptions = {}) =>
      createConfiguration(state, actionHandlers, options),
  };
};

export const StateDefaultConfiguration = /*@__PURE__*/createConfiguration({}, []);

export interface IStateConfigurationOptions {
  devToolsOptions?: IDevToolsOptions;
}
