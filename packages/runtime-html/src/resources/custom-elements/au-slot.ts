import { DI } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom.js';
import { IInstruction } from '../../renderer.js';
import { ViewModelKind } from '../../templating/controller.js';
import { IViewFactory } from '../../templating/view.js';
import { customElement } from '../custom-element.js';

import type { Writable } from '@aurelia/kernel';
import type { LifecycleFlags, Scope } from '@aurelia/runtime';
import type { ControllerVisitor, ICustomElementController, ICustomElementViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
import type { CustomElementDefinition } from '../custom-element.js';
import type { HydrateElementInstruction } from '../../renderer.js';

export type IProjections = Record<string, CustomElementDefinition>;
export const IProjections = DI.createInterface<IProjections>("IProjections");

export enum AuSlotContentType {
  Projection,
  Fallback,
}

export class SlotInfo {
  public constructor(
    public readonly name: string,
    public readonly type: AuSlotContentType,
    public readonly content: CustomElementDefinition,
  ) { }
}

export class AuSlot implements ICustomElementViewModel {
  /** @internal */
  public static get inject() { return [IInstruction, IViewFactory, IRenderLocation]; }

  public readonly view: ISyntheticView;
  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  private hostScope: Scope | null = null;
  private outerScope: Scope | null = null;

  public constructor(
    private readonly instruction: HydrateElementInstruction,
    factory: IViewFactory,
    location: IRenderLocation,
  ) {
    this.view = factory.create().setLocation(location);
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
    _flags: LifecycleFlags,
  ): void | Promise<void> {
    this.hostScope = this.$controller.scope.parentScope!;
    if (this.instruction.slotInfo!.type === AuSlotContentType.Projection) {
      // todo: replace the following block with an IContextController injection
      let contextController = this.$controller.parent;
      while (contextController != null) {
        if (contextController.vmKind === ViewModelKind.customElement
          && !(contextController.viewModel instanceof AuSlot)
        ) {
          break;
        }
        contextController = contextController.parent;
      }
      this.outerScope =  contextController?.parent?.scope ?? null;
    }
  }

  public attaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return this.view.activate(initiator, $controller, flags, this.outerScope ?? this.hostScope!, this.hostScope);
  }

  public detaching(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view.dispose();
    (this as Writable<this>).view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);

export interface IAuSlotsInfo extends AuSlotsInfo { }
export const IAuSlotsInfo = DI.createInterface<IAuSlotsInfo>('AuSlotsInfo');
export class AuSlotsInfo {
  /**
   * @param {string[]} projectedSlots - Name of the slots to which content are projected.
   */
  public constructor(
    public readonly projectedSlots: string[],
  ) { }
}
