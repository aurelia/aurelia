import {
  Constructable,
  DI,
  IContainer,
  InstanceProvider,
} from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { INode } from '../dom.js';
import { IPlatform } from '../platform.js';
import { getRenderContext } from './render-context.js';
import { CustomElement, CustomElementDefinition } from '../resources/custom-element.js';
import type { ISyntheticView } from './controller.js';

export interface ICompositionContext<T extends object> {
  container?: IContainer;
  component?: T | Constructable<T>;
  template?: string | Element;
  host: Element;
}

export interface IViewModelCompositionContext<T extends object> extends ICompositionContext<T> {
  component: Constructable<T>;
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

export class Composer implements IComposer {
  public static get inject() { return [IPlatform, IContainer]; }

  public constructor(
    private p: IPlatform,
    private container: IContainer,
  ) { }

  public compose<T extends object>(options: ICompositionContext<T>): ISyntheticView {
    const component = options.component;
    // do not use cached definition,
    // it's cached per context
    const def = CustomElementDefinition.create(
      this.getDefinition(component) ?? { name: CustomElement.generateName(), template: options.template }
    );
    const container = options.container ?? this.container;
    const instance = this.ensureViewModel(container, options.component ?? new EmtpyViewModel() as T, options.host);

    const controller = getRenderContext(def, container).getViewFactory().create();
    controller.lockScope(Scope.create(instance, null, true));
    controller.setHost(options.host);

    return controller;
  }

  private getDefinition(component?: object | Constructable) {
    const Ctor = (typeof component === 'function'
      ? component
      : component?.constructor) as Constructable;
    return CustomElement.isType(Ctor)
      ? CustomElement.getDefinition(Ctor)
      : null;
  }

  private ensureViewModel<T extends object>(container: IContainer, objectOrCtor: T | Constructable<T>, host: Element): T {
    if (typeof objectOrCtor === 'object') {
      return objectOrCtor;
    }

    const p = this.p;
    const ep = new InstanceProvider('ElementResolver');

    ep.prepare(host);
    container.registerResolver(INode, ep);
    container.registerResolver(p.Node, ep);
    container.registerResolver(p.Element, ep);
    container.registerResolver(p.HTMLElement, ep);

    return container.invoke(objectOrCtor);
  }
}

class EmtpyViewModel {}
