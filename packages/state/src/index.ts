// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />

// <input value.state="..." input.trigger="state.onInput">
// <input value.state:store1="..." input.dispatch="onUpdate">

export { StandardStateConfiguration } from './configuration';
export {
  Action,
} from './reducer';

export {
  IState,
  IStore as IStateContainer,
  type IStoreSubscriber as IStateSubscriber,
  IReducerAction,
  type IRegistrableReducer,
} from './interfaces';

export { StateBinding, } from './state-binding';
export {
  StateDispatchActionBinding,

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
