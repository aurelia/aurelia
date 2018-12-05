import { IRegistry, Reporter } from '../../../kernel';
import { INode } from '../../dom';
import { IScope, LifecycleFlags } from '../../observation';
import { bindingBehavior } from '../binding-behavior';
import { findOriginalEventTarget } from '../event-manager';
import { Listener } from '../listener';

/*@internal*/
// export function handleSelfEvent(this: SelfableBinding, event: Event): ReturnType<Listener['callSource']> {
//   const target = <INode><unknown>findOriginalEventTarget(event);

//   if (this.target !== target) {
//     return;
//   }

//   return this.selfEventCallSource(event);
// }

export type SelfableBinding = Listener & {
  selfEventCallSource: Listener['callSource'];
};

@bindingBehavior('self')
export class SelfBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void {
    // if (!binding.callSource || !binding.targetEvent) {
    //   throw Reporter.error(8);
    // }

    // binding.selfEventCallSource = binding.callSource;
    // binding.callSource = handleSelfEvent;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void {
    // binding.callSource = binding.selfEventCallSource;
    // binding.selfEventCallSource = null;
  }
}
