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
import { IDevToolsExtension, IDevToolsOptions } from './interfaces-devtools';
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
): IStateConfiguration => {
  return {
    register: (c: IContainer) => {
      c.register(
        Registration.instance(IState, initialState),
        ...standardRegistrations,
        ...actionHandlers.map(ActionHandler.define),
        /* istanbul ignore next */
        AppTask.creating(IContainer, container => {
          const store = container.get(IStore);
          const devTools = container.get(IDevToolsExtension);
          if (options.devToolsOptions?.disable !== true && devTools != null) {
            store.connectDevTools(options.devToolsOptions ?? {});
          }
        })
      );
    },
    init: <T1>(state: T1, optionsOrHandler: IStateConfigurationOptions | IActionHandler<T1>, ...actionHandlers: IActionHandler[]) => {
      const isHandler = typeof optionsOrHandler === 'function';
      const options = isHandler ? {} : optionsOrHandler;
      actionHandlers = isHandler ? [optionsOrHandler, ...actionHandlers] : actionHandlers;
      return createConfiguration(state, actionHandlers, options);
    }
  };
};

export const StateDefaultConfiguration = /*@__PURE__*/createConfiguration({}, []);

export interface IStateConfiguration {
  register(c: IContainer): void;
  /**
   * Create a new configuration for the State plugin
   */
  init: IConfigurationInit;
}

export interface IStateConfigurationOptions {
  devToolsOptions?: IDevToolsOptions;
}

export interface IConfigurationInit {
  /**
   * @param state - the initial state
   */
  <T1>(state: T1, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
  /**
   * @param state - the initial state
   * @param options - configuration for the Store
   */
  <T1>(state: T1, options: IStateConfigurationOptions, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
}
