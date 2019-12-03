import { NavigationInstructionResolver } from './../type-resolvers';
import { customAttribute, INode, bindable, BindingMode, IDOM, DelegationStrategy, IObserverLocator, LifecycleFlags, CustomAttribute } from '@aurelia/runtime';
import { IRouter } from '../router';
import { IEventManager } from '@aurelia/runtime-html';
import { IDisposable } from '@aurelia/kernel';

@customAttribute('goto')
export class GotoCustomAttribute {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private listener: IDisposable | null = null;
  private hasHref: boolean | null = null;

  private readonly element: HTMLElement;
  private observer: any;

  private activeClass: string = 'goto-active';
  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode element: INode,
    @IRouter private readonly router: IRouter,
    @IEventManager private readonly eventManager: IEventManager,
  ) {
    this.element = element as HTMLElement;
  }

  public binding(): void {
    this.listener = this.eventManager.addEventListener(
      this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
    this.updateValue();

    const observerLocator = this.router.container.get(IObserverLocator);
    this.observer = observerLocator.getObserver(LifecycleFlags.none, this.router, 'activeComponents') as any;
    this.observer.subscribe(this);
  }

  public unbinding(): void {
    if (this.listener !== null) {
      this.listener.dispose();
    }
    this.observer.unsubscribe(this);
  }

  public valueChanged(newValue: unknown): void {
    this.updateValue();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      this.element.setAttribute('href', value);
    }
  }

  public handleChange(): void {
    setTimeout(() => {
      const controller = CustomAttribute.for(this.element, 'goto')!.parent;
      const created = NavigationInstructionResolver.createViewportInstructions(this.router, this.value as any, { context: controller });
      // console.log('activeComponents', created, this.router.activeComponents);
      const instructions = NavigationInstructionResolver.toViewportInstructions(this.router, created.instructions);
      for (const instruction of instructions) {
        if (instruction.scope === null) {
          instruction.scope = created.scope;
        }
      }
      // console.log('active', created, this.checkActive(instructions, this.router.activeComponents));
      if (this.router.checkActive(instructions)) {
        this.element.classList.add(this.activeClass);
      } else {
        this.element.classList.remove(this.activeClass);
      }
    }, 100);
  }

  // public checkActive(instructions: ViewportInstruction[], active: ViewportInstruction[]) {
  //   for (const instruction of instructions) {
  //     const scopeInstructions = this.matchScope(active, instruction.scope!);
  //     const matching = scopeInstructions.filter(instr => instr.sameComponent(instruction));
  //     if (matching.length === 0) {
  //       return false;
  //     }
  //     if (Array.isArray(instruction.nextScopeInstructions)
  //       && instruction.nextScopeInstructions.length > 0
  //       && this.matchChildren(
  //         instruction.nextScopeInstructions,
  //         matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
  //       ) === false) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // public matchChildren(instructions: ViewportInstruction[], active: ViewportInstruction[]): boolean {
  //   for (const instruction of instructions) {
  //     const matching = active.filter(instr => instr.sameComponent(instruction));
  //     if (matching.length === 0) {
  //       return false;
  //     }
  //     if (Array.isArray(instruction.nextScopeInstructions)
  //       && instruction.nextScopeInstructions.length > 0
  //       && this.matchChildren(
  //         instruction.nextScopeInstructions,
  //         matching.map(instr => Array.isArray(instr.nextScopeInstructions) ? instr.nextScopeInstructions : []).flat()
  //       ) === false) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // public matchScope(instructions: ViewportInstruction[], scope: Scope): ViewportInstruction[] {
  //   const matching: ViewportInstruction[] = [];

  //   matching.push(...instructions.filter(instruction => instruction.scope === scope));
  //   matching.push(...instructions
  //     .filter(instr => instr.scope !== scope)
  //     .map(instr => Array.isArray(instr.nextScopeInstructions) ? this.matchScope(instr.nextScopeInstructions!, scope) : [])
  //     .flat()
  //   );
  //   return matching;
  // }
}
