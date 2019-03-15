import { ILifecycle, INode, ITemplateDefinition, LifecycleFlags, State } from '@aurelia/runtime';
import { DI } from '@aurelia/kernel';

export type IComponentLifecycleMock = InstanceType<ReturnType<typeof defineComponentLifecycleMock>>;

export function defineComponentLifecycleMock() {
  return class ComponentLifecycleMock {
    public $lifecycle: ILifecycle;
    public calls: [keyof ComponentLifecycleMock, ...any[]][] = [];

    constructor() {
      this.$lifecycle = DI.createContainer().get(ILifecycle);
    }

    public created(): void {
      this.trace(`created`);
      this.verifyStateBit(State.isBound, false, 'created');
      this.verifyStateBit(State.isAttached, false, 'created');
    }
    public binding(flags: LifecycleFlags): void {
      this.trace(`binding`, flags);
    }
    public bound(flags: LifecycleFlags): void {
      this.trace(`bound`, flags);
      this.verifyStateBit(State.isBound, true, 'bound');
    }
    public attaching(flags: LifecycleFlags): void {
      this.trace(`attaching`, flags);
      this.verifyStateBit(State.isBound, true, 'attaching');
      this.verifyStateBit(State.isAttached, false, 'attaching');
    }
    public attached(flags: LifecycleFlags): void {
      this.trace(`attached`, flags);
      this.verifyStateBit(State.isBound, true, 'attached');
      this.verifyStateBit(State.isAttached, true, 'attached');
    }
    public detaching(flags: LifecycleFlags): void {
      this.trace(`detaching`, flags);
      this.verifyStateBit(State.isBound, true, 'detaching');
      this.verifyStateBit(State.isAttached, true, 'detaching');
    }
    public detached(flags: LifecycleFlags): void {
      this.trace(`detached`, flags);
      this.verifyStateBit(State.isBound, true, 'detached');
      this.verifyStateBit(State.isAttached, false, 'detached');
    }
    public unbinding(flags: LifecycleFlags): void {
      this.trace(`unbinding`, flags);
      this.verifyStateBit(State.isBound, true, 'detached');
    }
    public unbound(flags: LifecycleFlags): void {
      this.trace(`unbound`, flags);
      this.verifyStateBit(State.isBound, false, 'detached');
    }
    public render(host: INode, parts: Record<string, ITemplateDefinition>): void {
      this.trace(`render`, host, parts);
    }
    public caching(flags: LifecycleFlags): void {
      this.trace(`caching`, flags);
    }

    public trace(fnName: keyof ComponentLifecycleMock, ...args: any[]): void {
      this.calls.push([fnName, ...args]);
    }

    public verifyPropertyValue(prop: string, value: any, during?: string): void {
      if (this[prop] !== value) {
        let msg = `expected ${prop} to be ${value}`;
        if (during !== undefined) {
          msg += ` during ${during}() lifecycle hook`;
        }
        msg += `, got but: ${this[prop]}`;
        this.fail(msg);
      }
    }

    public verifyStateBit(value: any, isTrue: boolean, during?: string): void {
      if (!isTrue) {
        if ((this['$state'] & value) === value) {
          let msg = `expected $state to NOT have flag ${value}`;
          if (during !== undefined) {
            msg += ` during ${during}() lifecycle hook`;
          }
          msg += `, got but: ${this['$state']}`;
          this.fail(msg);
        }
      } else {
        if ((this['$state'] & value) !== value) {
          let msg = `expected $state to have flag ${value}`;
          if (during !== undefined) {
            msg += ` during ${during}() lifecycle hook`;
          }
          msg += `, got but: ${this['$state']}`;
          this.fail(msg);
        }
      }
    }

    public verifyCreatedCalled(): void {
      this.verifyLastCall('created');
    }
    public verifyBindingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`binding`, flags);
    }
    public verifyBoundCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`bound`, flags);
    }
    public verifyAttachingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`attaching`, flags);
    }
    public verifyAttachedCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`attached`, flags);
    }
    public verifyDetachingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`detaching`, flags);
    }
    public verifyDetachedCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`detached`, flags);
    }
    public verifyUnbindingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`unbinding`, flags);
    }
    public verifyUnboundCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`unbound`, flags);
    }
    public verifyRenderCalled(host: INode, parts: Record<string, ITemplateDefinition>): void {
      this.verifyLastCall(`render`, host, parts);
    }
    public verifyCachingCalled(flags: LifecycleFlags): void {
      this.verifyLastCall(`caching`, flags);
    }
    public verifyLastCall(name: string, ...args: any[]): void {
      const calls = this.calls;
      if (calls.length === 0) {
        this.fail(`expected "${name}" to be the last called method, but no methods on this mock were called at all`);
      }
      const lastCall = calls.pop();
      if (lastCall[0] !== name) {
        if (calls.length === 0) {
          this.fail(`expected "${name}" to be the last called method, but the ONLY method called on this mock was "${lastCall[0]}"`);
        } else {
          const callChain = calls.map(c => `"${c[0]}"`).join('->');
          this.fail(`expected "${name}" to be the last called method, but the last method called on this mock was "${lastCall[0]}", preceded by: ${callChain}`);
        }
      }
      for (let i = 0, ii = args.length; i < ii; ++i) {
        const expected = args[i];
        const actual = lastCall[i + 1];
        if (expected !== actual) {
          this.fail(`expected argument #${i} of the call to "${name}" to be: ${expected}, but instead got: ${actual}`);
        }
      }
      if (lastCall.length > args.length + 1) {
        this.fail(`expected "${name}" to have been called with ${args.length} arguments, but it was called with ${lastCall.length - 1} arguments instead (last argument is: ${lastCall[lastCall.length - 1]})`);
      }
    }
    public verifyNoFurtherCalls(): void {
      if (this.calls.length > 0) {
        const callChain = this.calls.map(c => `"${c[0]}"`).join('->');
        this.fail(`expected no further calls, but found additional calls: ${callChain}`);
      }
    }
    public fail(message: string) {
      throw new Error(`ComponentLifecycleMock: ${message}`);
    }
  };
}
