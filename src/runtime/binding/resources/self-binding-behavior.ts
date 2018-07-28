import { IScope } from '../binding-context';
import { Listener } from '../listener';
import { Reporter } from '../../../kernel/reporter';
import { bindingBehavior } from '../binding-behavior';
import { BindingFlags } from '../binding-flags';

function findOriginalEventTarget(event) {
  return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
}

function handleSelfEvent(event: Event) {
  let target = findOriginalEventTarget(event);
  
  if (this.target !== target) {
    return;
  }

  this.selfEventCallSource(event);
}

type SelfableBinding = Listener & {
  selfEventCallSource: (event: Event) => any;
};

@bindingBehavior('self')
export class SelfBindingBehavior {
  bind(flags: BindingFlags, scope: IScope, binding: SelfableBinding) {
    if (!binding.callSource || !binding.targetEvent) {
      throw Reporter.error(8);
    }
    
    binding.selfEventCallSource = binding.callSource;
    binding.callSource = handleSelfEvent;
  }

  unbind(flags: BindingFlags, scope: IScope, binding: SelfableBinding) {
    binding.callSource = binding.selfEventCallSource;
    binding.selfEventCallSource = null;
  }
}
