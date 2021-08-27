import { SubscribeAttrPattern, SubscribeCommand, SubscribeCommandInstructionRenderer } from './subscribe-command';
import { SubscribeBindingBehavior } from './subscribe-binding-behavior';
import type { IContainer, IRegistry } from '@aurelia/kernel';

export const ObservableConfiguration: IRegistry = {
  register(container: IContainer): IContainer {
    return container.register(
      SubscribeAttrPattern,
      SubscribeCommand,
      SubscribeBindingBehavior,
      SubscribeCommandInstructionRenderer,
    );
  },
};
