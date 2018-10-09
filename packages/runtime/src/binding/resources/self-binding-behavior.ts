import { Reporter } from '@aurelia/kernel';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { Listener } from '../listener';

type CompatibleEvent = {
  target?: EventTarget;

  // legacy
  path?: EventTarget[];

  // old composedPath
  deepPath?(): EventTarget[];

  // current spec
  composedPath?(): EventTarget[];
};

/*@internal*/
export function findOriginalEventTarget(event: Event & CompatibleEvent): EventTarget {
  return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
}

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
