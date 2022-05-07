// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../global.d.ts" />

// <input value.state="..." input.trigger="state.onInput">
// <input value.state:store1="..." input.dispatch="onUpdate">

export { StateContainer, IState, IStateContainer, type IStateSubscriber } from './state';
export { StateBinding } from './state-binding';
export {
  StateAttributePattern,
  StateBindingCommand,
  StateBindingInstruction,
  StateBindingInstructionRenderer,
} from './state-templating';
export { StandardStateConfiguration } from './configuration';
