import { IBinding, IScope, LifecycleFlags } from '@aurelia/runtime';

export class MockBindingBehavior {
  public calls: [keyof MockBindingBehavior, ...any[]][] = [];

  public bind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...rest: any[]): void {
    this.trace('bind', flags, scope, binding, ...rest);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IBinding, ...rest: any[]): void {
    this.trace('unbind', flags, scope, binding, ...rest);
  }

  public trace(fnName: keyof MockBindingBehavior, ...args: any[]): void {
    this.calls.push([fnName, ...args]);
  }
}
