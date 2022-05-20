// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />

export { StateDefaultConfiguration } from './configuration';
export {
  Reducer as Action,
} from './reducer';

export {
  IState,
  IStore as IStateContainer,
  type IStoreSubscriber as IStateSubscriber,
  IReducer,
  type IRegistrableReducer,
} from './interfaces';

export { StateBinding, } from './state-binding';
export {
  StateDispatchBinding as StateDispatchActionBinding,

} from './state-dispatch';
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
