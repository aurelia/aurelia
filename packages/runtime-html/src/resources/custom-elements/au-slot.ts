import { DI, Writable } from '@aurelia/kernel';
import { Scope, LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import {
  ControllerVisitor,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
  MountStrategy
} from '../../lifecycle';
import { customElement, CustomElementDefinition } from '../custom-element';
import { IViewFactory } from '../../templating/view';
import { IInstruction, Instruction } from '../../instructions';

export type IProjections = Record<string, CustomElementDefinition>;
export const IProjections = DI.createInterface<IProjections>("IProjections").noDefault();

export enum AuSlotContentType {
  Projection,
  Fallback,
}

export class SlotInfo {
  public constructor(
    public readonly name: string,
    public readonly type: AuSlotContentType,
    public readonly projectionContext: ProjectionContext,
  ) { }
}

export class ProjectionContext {
  public constructor(
    public readonly content: CustomElementDefinition,
    public readonly scope: Scope | null = null
  ) { }
}

export class RegisteredProjections {
  public constructor(
    public readonly scope: Scope,
    public readonly projections: Record<string, CustomElementDefinition>,
  ) { }
}

export interface IProjectionProvider extends ProjectionProvider {}
export const IProjectionProvider = DI.createInterface<IProjectionProvider>('IProjectionProvider').withDefault(x => x.singleton(ProjectionProvider));

const projectionMap: WeakMap<IInstruction, RegisteredProjections> = new WeakMap<Instruction, RegisteredProjections>();
export class ProjectionProvider {
  public registerProjections(projections: Map<IInstruction, Record<string, CustomElementDefinition>>, scope: Scope): void {
    for (const [instruction, $projections] of projections) {
      projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
    }
  }

  public getProjectionFor(instruction: IInstruction): RegisteredProjections | null {
    return projectionMap.get(instruction) ?? null;
  }
}

@customElement({ name: 'au-slot', template: null, containerless: true })
export class AuSlot implements ICustomElementViewModel {
  public readonly view: ISyntheticView;
  public readonly $controller!: ICustomElementController<this>; // This is set by the controller after this instance is constructed

  private readonly isProjection: boolean;
  private hostScope: Scope | null = null;
  private readonly outerScope: Scope | null;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory,
    @IRenderLocation location: IRenderLocation,
  ) {
    this.view = factory.create();
    this.view.setLocation(location, MountStrategy.insertBefore);
    this.isProjection = factory.contentType === AuSlotContentType.Projection;
    this.outerScope = factory.projectionScope;
  }

  public binding(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.hostScope = this.$controller.scope.parentScope!;
  }

  public afterAttach(
    initiator: IHydratedController,
    parent: IHydratedParentController,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return this.view.activate(initiator, $controller, flags, this.outerScope ?? this.hostScope!, this.hostScope);
  }

  public beforeDetach(
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
