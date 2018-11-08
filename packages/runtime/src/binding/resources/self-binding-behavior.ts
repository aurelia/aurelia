import { Reporter } from '@aurelia/kernel';
import { BindingFlags, IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';
import { findOriginalEventTarget } from '../event-manager';
import { Listener } from '../listener';

/*@internal*/
export function handleSelfEvent(event: Event): ReturnType<Listener['callSource']> {
  const target = findOriginalEventTarget(event);

  if (this.target !== target) {
    return;
  }

  return this.selfEventCallSource(event);
}

export type SelfableBinding = Listener & {
  selfEventCallSource: Listener['callSource'];
};

@bindingBehavior('self')
export class SelfBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: SelfableBinding): void {
    if (!binding.callSource || !binding.targetEvent) {
      throw Reporter.error(8);
    }

    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: SelfableBinding): void {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null;
  }
}
