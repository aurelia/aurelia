import { nextId } from '@aurelia/kernel';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags, State } from '../../flags';
import { IController, IViewFactory, MountStrategy } from '../../lifecycle';
import { templateController } from '../custom-attribute';
import { bindable } from '../../templating/bindable';
import { Scope } from '../../observation/binding-context';

@templateController('with')
export class With<T extends INode = INode> {
  public readonly id: number = nextId('au$component');

  public readonly view: IController<T>;
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private $controller!: IController<T>; // This is set by the controller after this instance is constructed

  @bindable public value?: object;

  public constructor(
    @IViewFactory private readonly factory: IViewFactory<T>,
    @IRenderLocation private readonly location: IRenderLocation<T>
  ) {
    this.id = nextId('au$component');

    this.factory = factory;
    this.view = this.factory.create();
    this.view.hold(location, MountStrategy.insertBefore);
  }

  public valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if ((this.$controller.state & State.isBoundOrBinding) > 0) {
      this.bindChild(LifecycleFlags.fromBind);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.view.parent = this.$controller;
    this.bindChild(flags);
  }

  public attaching(flags: LifecycleFlags): void {
    this.view.attach(flags);
  }

  public detaching(flags: LifecycleFlags): void {
    this.view.detach(flags);
  }

  public unbinding(flags: LifecycleFlags): void {
    this.view.unbind(flags);
    this.view.parent = void 0;
  }

  private bindChild(flags: LifecycleFlags): void {
    const scope = Scope.fromParent(flags, this.$controller.scope!, this.value === void 0 ? {} : this.value);
    this.view.bind(flags, scope, this.$controller.part);
  }
}
