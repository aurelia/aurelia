import { LifecycleFlags, bindingBehavior } from '@aurelia/runtime';
import { Listener } from '../../binding/listener';
import { findOriginalEventTarget } from '../../observation/event-manager';

import type { Scope } from '@aurelia/runtime';

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
  public bind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: SelfableBinding): void {
    if (!binding.callSource || !binding.targetEvent) {
      throw new Error('Self binding behavior only supports events.');
    }

    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  public unbind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: SelfableBinding): void {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null!;
  }
}
