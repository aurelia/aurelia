// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />

export { StateDefaultConfiguration } from './configuration';
export {
  Reducer as Action,
} from './reducer';

export {
  IState,
  IStore,
  type IStoreSubscriber,
  IReducer,
  type IRegistrableReducer,
  type IAction,
} from './interfaces';

export { StateBinding, } from './state-binding';
export { StateDispatchBinding } from './state-dispatch-binding';
export {
  StateAttributePattern,
  StateBindingCommand,
  StateBindingInstruction,
  StateBindingInstructionRenderer,

  DispatchAttributePattern,
  DispatchBindingCommand,
  DispatchBindingInstruction,
  DispatchBindingInstructionRenderer,
} from './state-templating';

export { StateBindingBehavior } from './state-binding-behavior';
