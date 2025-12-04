/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { onResolve, resolve, optional } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';

import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller';
import type { IInstruction } from '@aurelia/template-compiler';
import type { INode } from '../../dom.node';
import { ErrorNames, createMappedError } from '../../errors';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import { IResumeContext, type ISSRContext, ISSRContext as ISSRContextToken } from '../../templating/hydration';
import type { IRenderLocation as IRenderLocationWithIndex } from '../../dom';

export class If implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'if',
    isTemplateController: true,
    bindables: {
      value: true,
      cache: {
        set: (v: unknown) => v === '' || !!v && v !== 'false',
      }
    }
  };

  public elseFactory?: IViewFactory = void 0;
  public elseView?: ISyntheticView = void 0;
  public ifView?: ISyntheticView = void 0;
  public view?: ISyntheticView = void 0;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public value: unknown = false;
  /**
   * `false` to always dispose the existing `view` whenever the value of if changes to false
   */
  public cache: boolean = true;
  private pending: void | Promise<void> = void 0;
  /** @internal */ private _wantsDeactivate: boolean = false;
  /** @internal */ private _swapId: number = 0;
  /** @internal */ private readonly _ifFactory = resolve(IViewFactory);
  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private _ssrContext: IResumeContext | undefined = resolve(optional(IResumeContext));
  /** @internal */ private readonly _ssrRecordContext: ISSRContext | undefined = resolve(optional(ISSRContextToken));

  public attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    if (this._ssrContext) {
      const ctx = this._ssrContext;
      this._ssrContext = void 0;
      return this._activateHydratedView(this.value, ctx);
    }
    return this._swap(this.value);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    this._wantsDeactivate = true;
    return onResolve(this.pending, () => {
      this._wantsDeactivate = false;
      this.pending = void 0;
      // Promise return values from user VM hooks are awaited by the initiator
      void this.view?.deactivate(initiator, this.$controller);
    });
  }

  public valueChanged(newValue: unknown, oldValue: unknown): void | Promise<void> {
    if (!this.$controller.isActive) return;

    newValue = !!newValue;
    oldValue = !!oldValue;
    if (newValue !== oldValue) return this._swap(newValue);
  }

  /** @internal */
  private _swap(value: unknown): void | Promise<void> {
    const currView = this.view;
    const ctrl = this.$controller;
    const swapId = this._swapId++;
    /**
     * returns true when
     * 1. entering deactivation of the [if] itself
     * 2. new swap has started since this change
     */
    const isCurrent = () => !this._wantsDeactivate && this._swapId === swapId + 1;
    let view: ISyntheticView | undefined;

    return onResolve(this.pending,
      () => this.pending = onResolve(
        currView?.deactivate(currView, ctrl),
        () => {
          if (!isCurrent()) {
            return;
          }
          // falsy -> truthy
          if (value) {
            view = (this.view = this.ifView = this.cache && this.ifView != null
              ? this.ifView
              : this._ifFactory.create()
            );
          } else {
            // truthy -> falsy
            view = (this.view = this.elseView = this.cache && this.elseView != null
              ? this.elseView
              : this.elseFactory?.create()
            );
          }
          // if the value is falsy
          // and there's no [else], `view` will be null
          if (view == null) {
            return;
          }
          // todo: location should be based on either the [if]/[else] attribute
          //       instead of always of the [if]
          view.setLocation(this._location);

          // SSR recording: rewrite markers and record view
          const ssrContext = this._ssrRecordContext;
          const controllerTargetIndex = (this._location as IRenderLocationWithIndex & { $targetIndex?: number }).$targetIndex;
          if (ssrContext != null && controllerTargetIndex != null) {
            ssrContext.recordController(controllerTargetIndex, 'if');
            const globalTargets = this._rewriteMarkersForSSR(view, ssrContext);
            const nodeCount = view.nodes.childNodes.length;
            ssrContext.recordView(controllerTargetIndex, 0, globalTargets, nodeCount);
          }

          return onResolve(
            view.activate(view, ctrl, ctrl.scope),
            () => {
              if (isCurrent()) {
                this.pending = void 0;
              }
            }
          );
        }
      )
    );
  }

  /**
   * Rewrite au-hid markers in a view's nodes to use globally unique indices.
   * Returns the array of global indices in instruction order (matching local target indices).
   * Also handles nested controller markers by updating their render location's $targetIndex.
   * @internal
   */
  private _rewriteMarkersForSSR(view: ISyntheticView, ssrContext: ISSRContext): number[] {
    // Map from local target index to global target index
    const localToGlobal: Map<number, number> = new Map();
    const fragment = view.nodes.childNodes;

    // Process all nodes in the view, extracting local indices and assigning global indices
    const processNode = (node: Node) => {
      if (node.nodeType === 1 /* Element */) {
        const el = node as Element;
        if (el.hasAttribute('au-hid')) {
          const localIndex = parseInt(el.getAttribute('au-hid')!, 10);
          const globalIndex = ssrContext.allocateGlobalIndex();
          localToGlobal.set(localIndex, globalIndex);
          el.setAttribute('au-hid', String(globalIndex));
        }
        // Process children
        for (let i = 0; i < el.childNodes.length; ++i) {
          processNode(el.childNodes[i]);
        }
      } else if (node.nodeType === 8 /* Comment */) {
        const comment = node as Comment;
        const text = comment.textContent ?? '';
        // Check for <!--au:N--> format
        if (text.startsWith('au:')) {
          const localIndex = parseInt(text.slice(3), 10);
          // Check if this is a controller marker by looking at next sibling
          const nextSibling = comment.nextSibling;
          const isControllerMarker = nextSibling?.nodeType === 8 /* Comment */ &&
            (nextSibling as Comment).textContent === 'au-start';

          const globalIndex = ssrContext.allocateGlobalIndex();
          localToGlobal.set(localIndex, globalIndex);
          comment.textContent = `au:${globalIndex}`;

          if (isControllerMarker) {
            // This is a controller marker - find the render location (au-end) and update its $targetIndex
            // The render location is the matching <!--au-end--> for this <!--au-start-->
            let depth = 1;
            let current = nextSibling?.nextSibling;
            while (current != null && depth > 0) {
              if (current.nodeType === 8 /* Comment */) {
                const currentText = (current as Comment).textContent;
                if (currentText === 'au-start') {
                  depth++;
                } else if (currentText === 'au-end') {
                  depth--;
                  if (depth === 0) {
                    // Found the matching au-end - update its $targetIndex
                    (current as Comment & { $targetIndex?: number }).$targetIndex = globalIndex;
                  }
                }
              }
              current = current.nextSibling;
            }
          }
        }
      }
    };

    for (let i = 0; i < fragment.length; ++i) {
      processNode(fragment[i]);
    }

    // Build globalTargets array in instruction order (sorted by local index)
    const maxLocalIndex = Math.max(...localToGlobal.keys(), -1);
    const globalTargets: number[] = [];
    for (let i = 0; i <= maxLocalIndex; i++) {
      const globalIndex = localToGlobal.get(i);
      if (globalIndex !== undefined) {
        globalTargets.push(globalIndex);
      }
    }

    return globalTargets;
  }

  /** @internal */
  private _activateHydratedView(
    value: unknown,
    context: IResumeContext
  ): void | Promise<void> {
    const ctrl = this.$controller;

    if (value && context.hasView(0)) {
      return this._adoptView(context, ctrl, this._ifFactory, 'if');
    }

    if (!value && this.elseFactory != null && context.hasView(0)) {
      return this._adoptView(context, ctrl, this.elseFactory, 'else');
    }

    this.view = void 0;
  }

  /** @internal */
  private _adoptView(
    context: IResumeContext,
    ctrl: ICustomAttributeController<this>,
    factory: IViewFactory,
    branch: 'if' | 'else'
  ): void | Promise<void> {
    const view = context.adoptView(0, factory);

    if (branch === 'if') {
      this.view = this.ifView = view;
    } else {
      this.view = this.elseView = view;
    }

    return onResolve(
      view.activate(view, ctrl, ctrl.scope),
      () => { this.pending = void 0; }
    );
  }

  public dispose(): void {
    this.ifView?.dispose();
    this.elseView?.dispose();
    this.ifView
      = this.elseView
      = this.view
      = void 0;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

export class Else implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'else',
    isTemplateController: true,
  };

  /** @internal */ private readonly _factory = resolve(IViewFactory);

  public link(
    controller: IHydratableController,
    _childController: ICustomAttributeController,
    _target: INode,
    _instruction: IInstruction,
  ): void {
    const children = controller.children!;
    const ifBehavior: If | ICustomAttributeController = children[children.length - 1] as If | ICustomAttributeController;
    if (ifBehavior instanceof If) {
      ifBehavior.elseFactory = this._factory;
    } else if (ifBehavior.viewModel instanceof If) {
      ifBehavior.viewModel.elseFactory = this._factory;
    } else {
      throw createMappedError(ErrorNames.else_without_if);
    }
  }
}
