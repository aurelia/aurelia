import { Reporter } from '@aurelia/kernel';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { Listener } from '../listener';

/*@internal*/
export function findOriginalEventTarget(event) {
  return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
}

/*@internal*/
export function handleSelfEvent(event: Event) {
  let target = findOriginalEventTarget(event);

  if (this.target !== target) {
    return;
  }

  this.selfEventCallSource(event);
}

export type SelfableBinding = Listener & {
  selfEventCallSource: (event: Event) => any;
};

@bindingBehavior('self')
export class SelfBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: SelfableBinding) {
    if (!binding.callSource || !binding.targetEvent) {
      throw Reporter.error(8);
    }

    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: SelfableBinding) {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null;
  }
}
