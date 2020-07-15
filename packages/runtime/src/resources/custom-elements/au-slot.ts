import { DI } from '@aurelia/kernel';
import {
  INode,
  IRenderLocation
} from '../../dom';
import { LifecycleFlags } from '../../flags';
import {
  ICustomElementController,
  ICustomElementViewModel,
  ISyntheticView,
  IViewFactory,
  MountStrategy
} from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { IScope } from '../../observation';
import {
  customElement,
  CustomElementDefinition
} from '../custom-element';

export type IProjections = Record<string, CustomElementDefinition>;
export const IProjections = DI.createInterface<IProjections>("IProjections").noDefault();

export enum AuSlotContentType {
  Projection,
  Fallback
}

export class SlotInfo {
  public constructor(
    public readonly name: string,
    public readonly type: AuSlotContentType,
    public readonly content: CustomElementDefinition,
  ) { }
}

@customElement({ name: 'au-slot', template: null, containerless: true })
export class AuSlot<T extends INode = Node> implements ICustomElementViewModel<T> {
  public readonly view: ISyntheticView<T>;
  public readonly $controller!: ICustomElementController<T, this>; // This is set by the controller after this instance is constructed

  private readonly isProjection: boolean;
  private hostScope: IScope | null = null;
  private outerScope: IScope | null = null;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation location: IRenderLocation<T>,
  ) {
    this.view = factory.create();
    this.view.hold(location, MountStrategy.insertBefore);
    this.isProjection = factory.contentType === AuSlotContentType.Projection;
  }

  public beforeBind(flags: LifecycleFlags): ILifecycleTask {
    this.hostScope = this.$controller.scope.parentScope!;
    if (this.isProjection) {
      let scope: IScope | null = this.hostScope;
      let found = false;
      while (!found) {
        scope = scope?.parentScope ?? null;
        if (scope === null) {
          found = true;
        } else if (scope.isComponentScope) {
          found = true;
          this.outerScope = scope;
        }
      }
    }

    this.view.parent = this.$controller;
    return this.view.bind(flags | LifecycleFlags.allowParentScopeTraversal, this.outerScope ?? this.hostScope, this.hostScope, undefined, this.factory.context.definition);
  }

  public beforeAttach(flags: LifecycleFlags): void {
    this.view.attach(flags);
  }

  public beforeDetach(flags: LifecycleFlags): void {
    this.view.detach(flags);
  }

  public beforeUnbind(flags: LifecycleFlags): ILifecycleTask {
    const task = this.view.unbind(flags);
    this.view.parent = void 0;
    return task;
  }
}
