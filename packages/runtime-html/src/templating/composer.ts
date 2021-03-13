import {
  Constructable,
  DI,
  IContainer,
  InstanceProvider,
} from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { INode, IRenderLocation } from '../dom';
import { IPlatform } from '../platform';
import { getRenderContext } from './render-context';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element';
import type { ISyntheticView } from './controller';

export interface ICompositionContext<T extends object> {
  container?: IContainer;
  viewModel?: T | Constructable<T>;
  template?: string | Element;
  host: Element | IRenderLocation;
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
  compose<T extends object>(options: ICompositionContext<T>): ISyntheticView;
}

export class Composer {
  public static get inject() { return [IPlatform, IContainer]; }

  public constructor(
    private p: IPlatform,
    private container: IContainer,
  ) { }

  public compose<T extends object>(options: ICompositionContext<T>): ISyntheticView {
    const p = this.p;
    const viewModel = options.viewModel;
    const def = CustomElementDefinition.create(
      CustomElement.isType(viewModel)
        ? CustomElement.getDefinition(viewModel)
        : { name: CustomElement.generateName(), template: options.template }
    );
    const container = options.container ?? this.container;
    const ep = new InstanceProvider('ElementResolver');

    ep.prepare(options.host);
    container.registerResolver(INode, ep);
    container.registerResolver(p.Node, ep);
    container.registerResolver(p.Element, ep);
    container.registerResolver(p.HTMLElement, ep);

    const instance = this.ensureViewModel(container, options.viewModel ?? new EmtpyViewModel() as T);

    const controller = getRenderContext(def, container).getViewFactory().create();
    controller.lockScope(Scope.create(instance, null, true));
    controller.setLocation(options.host);

    return controller;
  }

  private ensureViewModel<T extends object>(container: IContainer, objectOrCtor: T | Constructable<T>): T {
    return typeof objectOrCtor === 'object'
      ? objectOrCtor
      : container.invoke(objectOrCtor);
  }
}

class EmtpyViewModel {}
