import { bindable, CustomAttributeResource, ICustomAttribute, IView, LifecycleFlags, IViewFactory, IRenderLocation, IDOM, State } from '@aurelia/runtime';
// import { OverrideContext } from 'aurelia-binding';
// import { BoundViewFactory, ViewSlot } from 'aurelia-templating';

// const document: Document = PLATFORM.global.document;

class ViewSlot {
  constructor(...args: unknown[]) {}

  attached() {}
  detached() {}

  remove(...args: unknown[]) {

  }

  add(...args: unknown[]) {

  }
}

type PortalTarget = string | Element | null | undefined;

// tslint:disable-next-line:no-any
export type PortalLifecycleCallback = (target: Element, view: IView) => Promise<any> | any;



export interface PortalCustomAttribute extends ICustomAttribute {}
export class PortalCustomAttribute {

  /**
   * Only needs the BoundViewFactory as a custom viewslot will be used
   */
  public static inject: unknown[] = [IViewFactory, IDOM, IRenderLocation];

  /**
   * @bindable
   * Target to render to, CSS string | Element
   */
  // tslint:disable-next-line:prefer-optional
  public value: string | Element | null | undefined;

  /**
   * @bindable
   */
  // tslint:disable-next-line:prefer-optional
  public renderContext: string | Element | null | undefined;

  /**
   * @bindable
   */
  public strict: boolean;

  /**
   * @bindable
   */
  public initialRender: boolean;

  /**
   * @bindable
   * Will be called when the attribute receive new target after the first render.
   */
  public deactivating: PortalLifecycleCallback;

  /**
   * @bindable
   * Will be called after `portaled` element has been added to target
   */
  public activating: PortalLifecycleCallback;

  /**
   * @bindable
   * Will be called after activating has been resolved
   */
  public activated: PortalLifecycleCallback;
  /**
   * @bindable
   * Will be called after deactivating has been resolved.
   */
  public deactivated: PortalLifecycleCallback;
  /**
   * @bindable
   * The object that will becontextwhen calling life cycle methods above
   */
  public callbackContext: unknown;

  private currentTarget: typeof unset | Element | null;
  private isAttached: boolean;
  private viewSlot: ViewSlot | null;
  private view: IView;
  private removed: boolean;

  private viewFactory: IViewFactory;
  private originalViewSlot: ViewSlot;
  private dom: IDOM;
  private location: IRenderLocation;

  constructor(
    viewFactory: IViewFactory,
    dom: IDOM,
    originalLocation: IRenderLocation
  ) {
    this.currentTarget = unset;
    this.strict = false;
    this.initialRender = false;
    this.viewFactory = viewFactory;
    this.dom = dom;
    this.location = originalLocation;
  }

  /**
   * Query target element based on given CSS selector for target, and CSS selector for target querying context 
   */
  private static getTarget(target: PortalTarget, context?: PortalTarget): Element | null {
    if (target) {
      if (typeof target === 'string') {
        let queryContext: Element | Document = document;
        if (context) {
          if (typeof context === 'string') {
            context = document.querySelector(context);
          }
          if (context instanceof Element) {
            queryContext = context;
          }
        }
        target = queryContext.querySelector(target);
      }
      if (target instanceof Element) {
        return target;
      }
    }
    return null;
  }

  public binding(flags: LifecycleFlags): void {
    if (this.callbackContext === undefined) {
      this.callbackContext = this.$scope.bindingContext;
    }
    let view = this.view;
    if (!view) {
      view = this.view = this.viewFactory.create();
    }
    const shouldInitRender = this.initialRender;
    if (shouldInitRender) {
      // this.originalViewSlot.add(view);
      view.$mount(LifecycleFlags.none);
    }
    view.lockScope(this.$scope);
    view.$bind(flags, this.$scope);
    // if (shouldInitRender) {
    //   this.originalViewSlot.remove(view);
    // }
  }

  public attached(): void | Promise<void> {
    // this.isAttached = true;
    return this.render();
  }

  public detached(): void {
    if (this.removed) {
      this.view.$detach(LifecycleFlags.none);
    }
    // this.isAttached = false;
    // if (this.viewSlot) {
    //   this.viewSlot.detached();
    // }
  }

  public unbinding(flags: LifecycleFlags): void {
    // if (this.viewSlot) {
    //   this.viewSlot.remove(this.view);
    //   this.viewSlot = null;
    // }
    if (this.location) {
      this.view.$unbind(LifecycleFlags.none);
      this.view.release(LifecycleFlags.none);
      this.location = null;
    }
    this.view.$unbind(flags);
    this.callbackContext = null;
  }

  public targetChanged(): void | Promise<void> {
    return this.render();
  }

  private getTarget(): Element | null {
    let target = PortalCustomAttribute.getTarget(this.value, this.renderContext);
    if (target === null) {
      if (this.strict) {
        throw new Error('Render target not found.');
      } else {
        target = document.body;
      }
    }
    return target;
  }

  private prepareLocation(target: Element): IRenderLocation {
    const comment = target.appendChild(document.createComment('au-location'));
    return this.dom.convertToRenderLocation(comment);
  }

  private render(): void | Promise<void> {
    const oldTarget = this.currentTarget;
    const view = this.view;
    const target = this.currentTarget = this.getTarget();
    // const oldViewSlot = this.viewSlot;
    const oldLocation = this.location;

    if (oldTarget === target && oldLocation) {
      return;
    }

    const addAction: () => Promise<void> = () => {
      if (this.isAttached) {
        return Promise.resolve(
          typeof this.activating === 'function'
            ? this.activating.call(this.callbackContext, target, view)
            : null
        ).then(() => {
          if (target === this.currentTarget || oldTarget === unset) {
            this.location = this.prepareLocation(target);
            // const viewSlot = this.viewSlot = new ViewSlot(target!, true);
            view.$mount(LifecycleFlags.none);
            view.$attach(LifecycleFlags.none);
            view.$bind(LifecycleFlags.none);
            // viewSlot.attached();
            // viewSlot.add(view);
            this.removed = false;
          }
          return Promise.resolve().then(() => {
            if (typeof this.activated === 'function') {
              return this.activated.call(this.callbackContext, target, view);
            }
          });
        });
      }
      return Promise.resolve();
    };

    if (oldLocation) {
      return Promise
        .resolve(
          typeof this.deactivating === 'function'
            ? this.deactivating.call(this.callbackContext, oldTarget as Element, view)
            : null
        )
        .then(() => {
          if (typeof this.deactivated === 'function') {
            this.deactivated.call(this.callbackContext, oldTarget as Element, view);
          }
          this.location = null;
          // this.viewSlot = null;
          if (!this.removed) {
            view.$detach(LifecycleFlags.none);
            view.$unbind(LifecycleFlags.none);
            view.$unmount(LifecycleFlags.none);
            // oldViewSlot.remove(view);
            this.removed = true;
          }
          if (this.$state & State.isAttached) {
            return addAction();
          }
        });
    }
    if (this.$state & State.isAttached) {
      return addAction();
    }
  }
}

const unset = {};

(klass => {
  ['value', 'renderContext'].forEach(prop => bindable({ callback: 'targetChanged' })(klass, prop));
  ['strict', 'initialHandler', 'deactivating', 'activating', 'activated', 'deactivated', 'callbackContext'].forEach(prop => bindable(prop)(klass));

  CustomAttributeResource.define({ name: 'portal', isTemplateController: true }, klass);
})(PortalCustomAttribute);
