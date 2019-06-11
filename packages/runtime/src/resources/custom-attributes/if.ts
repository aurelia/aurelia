import { InjectArray, InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { CompositionCoordinator, IView, IViewFactory } from '../../lifecycle';
import { ProxyObserver } from '../../observation/proxy-observer';
import { bindable } from '../../templating/bindable';
import { CustomAttributeResource, ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';

export interface If<T extends INode = INode> extends ICustomAttribute<T> {}
export class If<T extends INode = INode> implements If<T> {
  public static readonly inject: InjectArray = [IViewFactory, IRenderLocation, CompositionCoordinator];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  @bindable public value: boolean;

  public elseFactory: IViewFactory<T> | null;
  public elseView: IView<T> | null;
  public ifFactory: IViewFactory<T>;
  public ifView: IView<T> | null;
  public location: IRenderLocation<T>;
  public coordinator: CompositionCoordinator;
  private persistentFlags: LifecycleFlags;

  constructor(
    ifFactory: IViewFactory<T>,
    location: IRenderLocation<T>,
    coordinator: CompositionCoordinator
  ) {
    this.value = false;

    this.coordinator = coordinator;
    this.elseFactory = null;
    this.elseView = null;
    this.ifFactory = ifFactory;
    this.ifView = null;
    this.location = location;
    this.persistentFlags = LifecycleFlags.none;
  }

  public binding(flags: LifecycleFlags): void {
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    const view = this.updateView(flags);
    this.coordinator.compose(view, flags);
    this.coordinator.binding(flags, this.$scope);
  }

  public attaching(flags: LifecycleFlags): void {
    this.coordinator.attaching(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.coordinator.detaching(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.coordinator.unbinding(flags);
  }

  public caching(flags: LifecycleFlags): void {
    if (this.ifView !== null && this.ifView.release(flags)) {
      this.ifView = null;
    }

    if (this.elseView !== null && this.elseView.release(flags)) {
      this.elseView = null;
    }

    this.coordinator.caching(flags);
  }

  public valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void {
    if (this.$state & (State.isBound | State.isBinding)) {
      flags |= this.persistentFlags;
      const $this = ProxyObserver.getRawIfProxy(this);
      if (flags & LifecycleFlags.fromFlush) {
        const view = $this.updateView(flags);
        $this.coordinator.compose(view, flags);
      } else {
        $this.$lifecycle.enqueueFlush($this).catch(error => { throw error; });
      }
    }
  }

  public flush(flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    const $this = ProxyObserver.getRawIfProxy(this);
    const view = $this.updateView(flags);
    $this.coordinator.compose(view, flags);
  }

  /** @internal */
  public updateView(flags: LifecycleFlags): IView<T> | null {
    let view: IView<T> | null;

    if (this.value) {
      view = this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
    } else if (this.elseFactory !== null) {
      view = this.elseView  = this.ensureView(this.elseView, this.elseFactory, flags);
    } else {
      view = null;
    }

    return view;
  }

  /** @internal */
  public ensureView(view: IView<T> | null, factory: IViewFactory<T>, flags: LifecycleFlags): IView<T> {
    if (view === null) {
      view = factory.create(flags);
    }

    view.hold(this.location);

    return view;
  }
}
CustomAttributeResource.define({ name: 'if', isTemplateController: true }, If);

export interface Else<T extends INode = INode> extends ICustomAttribute<T> {}
export class Else<T extends INode = INode> implements Else<T> {
  public static readonly inject: InjectArray = [IViewFactory];

  public static readonly register: IRegistry['register'];
  public static readonly bindables: IAttributeDefinition['bindables'];
  public static readonly kind: ICustomAttributeResource;
  public static readonly description: AttributeDefinition;

  private readonly factory: IViewFactory<T>;

  constructor(factory: IViewFactory<T>) {
    this.factory = factory;
  }

  public link(ifBehavior: If<T>): void {
    ifBehavior.elseFactory = this.factory;
  }
}
CustomAttributeResource.define({ name: 'else', isTemplateController: true }, Else);
