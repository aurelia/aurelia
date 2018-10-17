import { IContainer, IDisposable, Immutable, ImmutableArray, IResolver, IServiceLocator, PLATFORM, Reporter } from '@aurelia/kernel';
import { DOM, INode, IRenderLocation } from '../dom';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';
import { IViewFactory } from './view';

export interface IRenderContext extends IServiceLocator {
  createChild(): IRenderContext;
  render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
  beginComponentOperation(renderable: IRenderable, target: any, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation, locationIsContainer?: boolean): IDisposable;
}

/*@internal*/
export type ExposedContext = IRenderContext & IDisposable & IContainer;

export function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<any>): IRenderContext {
  const context = <ExposedContext>parentRenderContext.createChild();
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider(renderingEngine);
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = renderingEngine.createRenderer(context);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    renderer.render(renderable, targets, templateDefinition, host, parts)
  };

  context.beginComponentOperation = function(renderable: IRenderable, target: any, instruction: ITargetedInstruction, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation): IDisposable {
    renderableProvider.prepare(renderable);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);

    if (factory) {
      factoryProvider.prepare(factory, parts);
    }

    if (location) {
      renderLocationProvider.prepare(location);
    }

    return context;
  };

  context.dispose = function(): void {
    factoryProvider.dispose();
    renderableProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
    renderLocationProvider.dispose();
  };

  return context;
}

/*@internal*/
export class InstanceProvider<T> implements IResolver {
  private instance: T = null;

  public prepare(instance: T): void {
    this.instance = instance;
  }

  public resolve(handler: IContainer, requestor: IContainer): T {
    if (this.instance === undefined) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    return this.instance;
  }

  public dispose(): void {
    this.instance = null;
  }
}

/*@internal*/
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory;
  private replacements: TemplatePartDefinitions;

  constructor(private renderingEngine: IRenderingEngine) {}

  public prepare(factory: IViewFactory, parts: TemplatePartDefinitions): void {
    this.factory = factory;
    this.replacements = parts || PLATFORM.emptyObject;
  }

  public resolve(handler: IContainer, requestor: ExposedContext): IViewFactory {
    const factory = this.factory;
    if (factory === undefined) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
      throw Reporter.error(51); // TODO: organize error codes
    }
    const found = this.replacements[factory.name];
    if (found) {
      return this.renderingEngine.getViewFactory(found, requestor);
    }

    return this.factory;
  }

  public dispose(): void {
    this.factory = null;
    this.replacements = null;
  }
}
