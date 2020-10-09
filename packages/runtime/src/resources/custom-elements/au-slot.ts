import { DI, IContainer, Registration, Writable } from '@aurelia/kernel';
import {
  INode,
  IRenderLocation,
} from '../../dom';
import { LifecycleFlags } from '../../flags';
import {
  ControllerVisitor,
  ICustomElementController,
  ICustomElementViewModel,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
  IViewFactory,
  MountStrategy
} from '../../lifecycle';
import { IScope } from '../../observation';
import {
  customElement,
  CustomElementDefinition
} from '../custom-element';
import { IHydrateElementInstruction, ITargetedInstruction } from '../../definitions';

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
    public readonly scope: IScope | null = null
  ) { }
}

export class RegisteredProjections {
  public constructor(
    public readonly scope: IScope,
    public readonly projections: Record<string, CustomElementDefinition>,
  ) { }
}

export interface IProjectionProvider {
  registerProjections(projections: Map<ITargetedInstruction, IProjections>, scope: IScope): void;
  getProjectionFor(instruction: IHydrateElementInstruction): RegisteredProjections | null;
}

export const IProjectionProvider = DI.createInterface<IProjectionProvider>('IProjectionProvider').noDefault();

const projectionMap: WeakMap<ITargetedInstruction, RegisteredProjections> = new WeakMap<ITargetedInstruction, RegisteredProjections>();
export class ProjectionProvider implements IProjectionProvider {

  public static register(container: IContainer): IContainer {
    return container.register(Registration.singleton(IProjectionProvider, ProjectionProvider));
  }

  public registerProjections(projections: Map<ITargetedInstruction, Record<string, CustomElementDefinition>>, scope: IScope): void {
    for (const [instruction, $projections] of projections) {
      projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
    }
  }

  public getProjectionFor(instruction: IHydrateElementInstruction): RegisteredProjections | null {
    return projectionMap.get(instruction) ?? null;
  }
}

@customElement({ name: 'au-slot', template: null, containerless: true })
export class AuSlot<T extends INode = Node> implements ICustomElementViewModel<T> {
  public readonly view: ISyntheticView<T>;
  public readonly $controller!: ICustomElementController<T, this>; // This is set by the controller after this instance is constructed

  private readonly isProjection: boolean;
  private hostScope: IScope | null = null;
  private readonly outerScope: IScope | null;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    this.view = factory.create();
    this.view.setLocation(location, MountStrategy.insertBefore);
    this.isProjection = factory.contentType === AuSlotContentType.Projection;
    this.outerScope = factory.projectionScope;
  }

  public beforeBind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    this.hostScope = this.$controller.scope.parentScope!;
  }

  public afterAttach(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    const { $controller } = this;
    return this.view.activate(initiator, $controller, flags, this.outerScope ?? this.hostScope!, this.hostScope);
  }

  public afterUnbind(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void | Promise<void> {
    return this.view.deactivate(initiator, this.$controller, flags);
  }

  public onCancel(
    initiator: IHydratedController<T>,
    parent: IHydratedParentController<T>,
    flags: LifecycleFlags,
  ): void {
    this.view.cancel(initiator, this.$controller, flags);
  }

  public dispose(): void {
    this.view.dispose();
    (this as Writable<this>).view = (void 0)!;
  }

  public accept(visitor: ControllerVisitor<T>): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}
