import { IContainer, PLATFORM, all, Registration, Writable, IResourceKind } from '@aurelia/kernel';
import { bindable, CustomElementResource, INode, LifecycleFlags, TemplatePartDefinitions, IRenderContext, IElementTemplateProvider, IRenderingEngine, IDOM, createRenderContext, TemplateDefinition, TargetedInstructionType, Interpolation, AccessScope, ITargetedInstruction, ITemplateCompiler, buildTemplateDefinition, ITemplateFactory, ICustomElement, IProjectorLocator, Scope, State, IScope, IBindScope, IAttach, ILifecycleMount, ILifecycleUnmount, ILifecycle } from '@aurelia/runtime';
import { Router } from '../router';
import { IViewportOptions, Viewport } from '../viewport';

// tslint:disable:no-invalid-template-strings

export interface ViewportCustomElement extends ICustomElement<Node> { }

export class ViewportCustomElement {
  public static readonly inject: ReadonlyArray<Function> = [Router, INode];
  public static readonly kind = CustomElementResource;
  public static readonly description: TemplateDefinition = {
    name: 'au-viewport',
    template: '<div class="viewport-header"> Viewport: <b><au-m class="au"></au-m> </b> </div>',
    cache: 0,
    build: { required: false },
    bindables: {
      name: { property: 'name', attribute: 'name' },
      scope: { property: 'scope', attribute: 'scope' },
      usedBy: { property: 'usedBy', attribute: 'used-by' },
      default: { property: 'default', attribute: 'default' },
      noLink: { property: 'noLink', attribute: 'no-link' },
      noHistory: { property: 'noHistory', attribute: 'no-history' }
    },
    instructions: [[{ type: 'ha', from: new Interpolation(['', ''], [new AccessScope('name')]) } as unknown as ITargetedInstruction]],
    dependencies: PLATFORM.emptyArray,
    surrogates: PLATFORM.emptyArray,
    containerless: false,
    shadowOptions: null,
    hasSlots: false
  };

  public name: string;
  public scope: boolean;
  public usedBy: string;
  public default: string;
  public noLink: boolean;
  public noHistory: boolean;

  public viewport: Viewport;

  public $nextBind: IBindScope;
  public $prevBind: IBindScope;
  public $bindableHead: IBindScope;
  public $bindableTail: IBindScope;
  public $nextAttach: IAttach;
  public $prevAttach: IAttach;
  public $attachableHead: IAttach;
  public $attachableTail: IAttach;
  public $nextMount: ILifecycleMount;
  public $nextUnmount: ILifecycleUnmount;

  private readonly router: Router;
  private readonly element: Element;

  constructor(router: Router, element: Element) {
    this.router = router;
    this.element = element;

    this.name = 'default';
    this.scope = null;
    this.usedBy = null;
    this.default = null;
    this.noLink = null;
    this.noHistory = null;
    this.viewport = null;

    this.$nextBind = null;
    this.$prevBind = null;
    this.$bindableHead = null;
    this.$bindableTail = null;
    this.$nextAttach = null;
    this.$prevAttach = null;
    this.$attachableHead = null;
    this.$attachableTail = null;
    this.$nextMount = null;
    this.$nextUnmount = null;
  }

  public static register(container: IContainer): void {
    Registration.transient(`custom-element:au-viewport`, this).register(container);
  }

  public $hydrate(
    this: Writable<ICustomElement>,
    dom: IDOM,
    projectorLocator: IProjectorLocator,
    renderingEngine: IRenderingEngine,
    host: INode,
    parentContext: IRenderContext
  ): void {
    this.$scope = Scope.create(this, null);
    this.$host = host;
    this.$projector = projectorLocator.getElementProjector(dom, this, host, PLATFORM.emptyObject as unknown as TemplateDefinition);

    this.$lifecycle = parentContext.get(ILifecycle);

    const templateFactory = parentContext.get(ITemplateFactory);
    const renderContext = createRenderContext(dom, parentContext, null, null);

    const template = templateFactory.create(renderContext, ViewportCustomElement.description);
    template.render(this, host, PLATFORM.emptyObject);

    this.created();
  }

  public $bind(this: Writable<ICustomElement> & this, flags: LifecycleFlags): void {
    if (this.$state & State.isBound) {
      return;
    }
    this.$lifecycle.beginBind();

    flags |= LifecycleFlags.fromBind;

    this.$lifecycle.enqueueUnbound(this);

    if (this.viewport) {
      this.viewport.binding(flags);
    }

    let current = this.$bindableHead;
    while (current !== null) {
      current.$bind(flags, this.$scope);
      current = (current as unknown as { $nextBind: IBindScope }).$nextBind;
    }

    this.$state |= State.isBound;
    this.$lifecycle.endBind(flags);
  }

  public $attach(this: Writable<ICustomElement> & this, flags: LifecycleFlags): void {
    if (this.$state & State.isAttached) {
      return;
    }
    this.$lifecycle.beginAttach();
    flags |= LifecycleFlags.fromAttach;

    if (this.viewport) {
      this.viewport.attaching(flags);
    }

    this.$lifecycle.enqueueMount(this);

    this.$state |= State.isAttached;
    this.$lifecycle.endAttach(flags);
  }

  public $mount(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
    if (!(this.$state & State.isMounted)) {
      this.$state |= State.isMounted;
      this.$projector.project(this.$nodes);
    }
  }

  public $unmount(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
    if (this.$state & State.isMounted) {
      this.$state &= ~State.isMounted;
      this.$projector.take(this.$nodes);
    }
  }

  public $detach(this: Writable<ICustomElement> & this, flags: LifecycleFlags): void {
    if (this.$state & State.isAttached) {
      this.$lifecycle.beginDetach();
      flags |= LifecycleFlags.fromDetach;

      this.$lifecycle.enqueueUnmount(this);

      if (this.viewport) {
        this.viewport.detaching(flags);
      }

      this.$state &= ~State.isAttached;
      this.$lifecycle.endDetach(flags);
    }
  }

  public $unbind(this: Writable<ICustomElement> & this, flags: LifecycleFlags): void {
    if (this.$state & State.isBound) {
      this.$lifecycle.beginBind();

      flags |= LifecycleFlags.fromUnbind;

      if (this.viewport) {
        this.viewport.unbinding(flags);
      }

      let current = this.$bindableTail;
      while (current !== null) {
        current.$unbind(flags);
        current = (current as unknown as { $prevBind: IBindScope }).$prevBind;
      }

      this.$state &= ~State.isBound;
      this.$lifecycle.endUnbind(flags);
    }
  }


  public created(...rest) {
    console.log('Created', rest);
    const booleanAttributes = {
      'scope': 'scope',
      'no-link': 'noLink',
      'no-history': 'noHistory',
    };
    const valueAttributes = {
      'used-by': 'usedBy',
      'default': 'default',
    };

    const name = this.element.hasAttribute('name') ? this.element.getAttribute('name') : 'default';
    const options: IViewportOptions = {};

    for (const attribute in booleanAttributes) {
      if (this.element.hasAttribute[attribute]) {
        options[booleanAttributes[attribute]] = true;
      }
    }
    for (const attribute in valueAttributes) {
      if (this.element.hasAttribute(attribute)) {
        const value = this.element.getAttribute(attribute);
        if (value && value.length) {
          options[valueAttributes[attribute]] = value;
        }
      }
    }
    this.viewport = this.router.addViewport(name, this.element, (this as any).$context.get(IContainer), options);
  }

  public bound(): void {
    // const options: IViewportOptions = { scope: this.element.hasAttribute('scope') };
    // if (this.usedBy && this.usedBy.length) {
    //   options.usedBy = this.usedBy;
    // }
    // if (this.default && this.default.length) {
    //   options.default = this.default;
    // }
    // if (this.element.hasAttribute('no-link')) {
    //   options.noLink = true;
    // }
    // if (this.element.hasAttribute('no-history')) {
    //   options.noHistory = true;
    // }
    // this.viewport = this.router.addViewport(this.name, this.element, (this as any).$context.get(IContainer), options);
  }
  public unbound(): void {
    this.router.removeViewport(this.viewport);
  }
}
