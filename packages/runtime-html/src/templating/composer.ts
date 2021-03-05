import {
  Constructable,
  DI,
  IContainer,
} from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { IPlatform } from '../platform';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element';
import { Controller, ICustomElementController } from './controller';

export interface ICompositionContext<T extends object> {
  container?: IContainer;
  viewModel?: T | Constructable<T>;
  template?: string | Element;
  host?: Element;
}

export interface IViewModelCompositionContext<T extends object> extends ICompositionContext<T> {
  viewModel: Constructable<T>;
}

export interface ITemplateBasedCompositionContext extends ICompositionContext<object> {
  template: string | Element;
}

export const IComposer = DI.createInterface<IComposer>('IComposer', x => x.singleton(Composer));
export interface IComposer {
  /**
   * Compose a controller based on given view & view model
   */
  compose<T extends object>(options: ICompositionContext<T>): ICustomElementController<T>;
}

export class Composer {
  public static get inject() { return [IPlatform, IContainer]; }

  public constructor(
    private p: IPlatform,
    private container: IContainer,
  ) { }

  public compose<T extends object>(options: ICompositionContext<T>): ICustomElementController<T> {
    const viewModel = options.viewModel;
    const def = CustomElementDefinition.create(
      CustomElement.isType(viewModel)
        ? CustomElement.getDefinition(viewModel)
        : { name: CustomElement.generateName(), template: options.template }
    );
    const container = options.container ?? this.container.createChild();
    const instance = this.ensureViewModel(container, options.viewModel ?? {} as T);
    const host = options.host as HTMLElement ?? this.p.document.body;

    return Controller.forCustomElement<T>(
      null,
      container,
      instance,
      host,
      null,
      LifecycleFlags.none,
      true,
      def,
    );
  }

  private ensureViewModel<T extends object>(container: IContainer, objectOrCtor: T | Constructable<T>): T {
    return typeof objectOrCtor === 'object'
      ? objectOrCtor
      : container.invoke(objectOrCtor);
  }
}
