import { LifecycleFlags, bindingBehavior } from '@aurelia/runtime';
import { Listener } from '../../binding/listener.js';

import type { Scope } from '@aurelia/runtime';

/** @internal */
export function handleSelfEvent(this: SelfableBinding, event: Event): ReturnType<Listener['callSource']> {
  const target = event.composedPath()[0];

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
  public bind(flags: LifecycleFlags, _scope: Scope, binding: SelfableBinding): void {
    if (!binding.callSource || !binding.targetEvent) {
      throw new Error('Self binding behavior only supports events.');
    }

    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  public unbind(flags: LifecycleFlags, _scope: Scope, binding: SelfableBinding): void {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null!;
  }
}
