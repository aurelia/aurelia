import { Reporter } from '@aurelia/kernel';
import { IScope, LifecycleFlags, bindingBehavior } from '@aurelia/runtime';
import { Listener } from '../../binding/listener';
import { findOriginalEventTarget } from '../../observation/event-manager';

/** @internal */
export function handleSelfEvent(this: SelfableBinding, event: Event): ReturnType<Listener['callSource']> {
  const target = findOriginalEventTarget(event) as unknown as Node;

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
  public bind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void {
    if (!binding.callSource || !binding.targetEvent) {
      throw Reporter.error(8);
    }

    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null!;
  }
}
