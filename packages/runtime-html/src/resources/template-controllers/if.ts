/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { isPromise, isString, onResolve, resolve } from '@aurelia/kernel';
import { IRenderLocation } from '../../dom';
import { IViewFactory } from '../../templating/view';
import { IPlatform } from '../../platform';

import type { INodeSequence } from '../../dom';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, ICustomElementController, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller';
import { type HydrateTemplateController, type IInstruction } from '@aurelia/template-compiler';
import type { INode } from '../../dom.node';
import { ErrorNames, createMappedError } from '../../errors';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import { isSSRTemplateController, adoptSSRView, type ISSRScope, type ISSRTemplateController } from '../../templating/ssr';

const elseLinkMarker = '__au_elseLink';

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
  /** @internal */ private readonly _platform = resolve(IPlatform);

  public attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
    // SSR hydration: adopt existing DOM instead of creating new views.
    // _hydrateView clears ssrScope, so reactivation takes the normal path.
    const ssrScope = this.$controller.ssrScope;
    if (ssrScope != null && isSSRTemplateController(ssrScope) && ssrScope.type === 'if') {
      return this._hydrateView(ssrScope);
    }
    return this._swap(this.value, false);
  }

  public detaching(initiator: IHydratedController, _parent: IHydratedParentController): void | Promise<void> {
    this._wantsDeactivate = true;
    return onResolve(this.pending, () => {
      this._wantsDeactivate = false;
      this.pending = void 0;
      // The ancestor initiator tracks descendant async teardown. If only needs
      // to keep its own pending swap ahead of this final deactivation.
      void this.view?.deactivate(initiator, this.$controller);
    });
  }

  public valueChanged(newValue: unknown, oldValue: unknown): void | Promise<void> {
    if (!this.$controller.isActive) return;

    newValue = !!newValue;
    oldValue = !!oldValue;
    if (newValue !== oldValue) return this._swap(newValue, true);
  }

  /** @internal */
  private _swap(value: unknown, recoverAfterFailure: boolean): void | Promise<void> {
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
        currView?.isActive ? currView.deactivate(currView, ctrl) : void 0,
        () => {
          if (!isCurrent()) {
            return;
          }
          // falsy -> truthy
          if (value) {
            view = (this.view = this.ifView = this.cache && this.ifView != null
              ? this.ifView
              : this._ifFactory.create(ctrl)
            );
          } else {
            // truthy -> falsy
            view = (this.view = this.elseView = this.cache && this.elseView != null
              ? this.elseView
              : this.elseFactory?.create(ctrl)
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

          const complete = (): void => {
            if (isCurrent()) {
              this.pending = void 0;
            }
          };
          const result = view.activate(view, ctrl, ctrl.scope);
          if (recoverAfterFailure && isPromise(result)) {
            return result.then(complete, () => {
              complete();
              // Value-driven swaps historically remain reusable after an async
              // branch failure. Initial activation uses the rejecting path so
              // application start still reports an invalid initial tree.
              void view!.deactivate(view!, ctrl);
            });
          }
          return onResolve(result, complete);
        }
      )
    );
  }

  /**
   * SSR hydration: adopt existing DOM instead of creating new views.
   * @internal
   */
  private _hydrateView(ssrScope: ISSRTemplateController): void | Promise<void> {
    const ctrl = this.$controller;
    const wasIfBranch = (ssrScope.state as { value?: boolean } | undefined)?.value === true;
    const factory = wasIfBranch ? this._ifFactory : this.elseFactory;

    if (factory == null || ssrScope.views.length === 0) {
      ctrl.ssrScope = void 0;
      return;
    }

    const result = adoptSSRView(ssrScope, factory, ctrl, this._location, this._platform);
    if (result == null) {
      ctrl.ssrScope = void 0;
      return;
    }

    const { view } = result;
    if (wasIfBranch) {
      this.view = this.ifView = view;
    } else {
      this.view = this.elseView = view;
    }

    ctrl.ssrScope = void 0;
    return view.activate(view, ctrl, ctrl.scope);
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

class ElseIfViewFactory implements IViewFactory {
  public constructor(
    private readonly _factory: IViewFactory,
    private readonly _getElseFactory: () => IViewFactory | undefined,
  ) {}

  public get name(): string {
    return this._factory.name;
  }

  public get container() {
    return this._factory.container;
  }

  public get def() {
    return this._factory.def;
  }

  public set def(value) {
    this._factory.def = value;
  }

  public get isCaching(): boolean {
    return this._factory.isCaching;
  }

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    this._factory.setCacheSize(size, doNotOverrideIfAlreadySet);
  }

  public canReturnToCache(controller: ISyntheticView): boolean {
    return this._factory.canReturnToCache(controller);
  }

  public tryReturnToCache(controller: ISyntheticView): boolean {
    return this._factory.tryReturnToCache(controller);
  }

  public create(
    parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined,
  ): ISyntheticView {
    return this._applyElseFactory(this._factory.create(parentController));
  }

  public createAdopted(
    parentController: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined,
    adoptedNodes: INodeSequence,
    ssrScope?: ISSRScope,
  ): ISyntheticView {
    return this._applyElseFactory(this._factory.createAdopted(parentController, adoptedNodes, ssrScope));
  }

  private _applyElseFactory(view: ISyntheticView): ISyntheticView {
    const child = view.children?.[0];
    if (child != null && child.vmKind === 'customAttribute' && child.viewModel instanceof If) {
      child.viewModel.elseFactory = this._getElseFactory();
    }
    return view;
  }
}

export class Else implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'else',
    isTemplateController: true,
    attributeLink: { direction: 'forward', marker: elseLinkMarker, target: 'if' },
  };

  /** @internal */ private readonly _factory = resolve(IViewFactory);
  public isElseIf: boolean = false;
  /** @internal */ private _effectiveFactory: IViewFactory | undefined = void 0;
  /** @internal */ private _chainedElseFactory: IViewFactory | undefined = void 0;

  public link(
    controller: IHydratableController,
    childController: ICustomAttributeController,
    _target: INode,
    instruction: IInstruction,
  ): void {
    const children = controller.children;
    const prevBehavior = children?.[children.length - 1] as ICustomAttributeController | undefined;
    if (prevBehavior == null) {
      throw createMappedError(ErrorNames.else_without_if);
    }
    const prevViewModel = prevBehavior.viewModel;
    if (!(prevViewModel instanceof If || prevViewModel instanceof Else)) {
      throw createMappedError(ErrorNames.else_without_if);
    }
    const link = childController.definition.attributeLink;
    const stampedTarget = link == null
      ? void 0
      : (instruction as HydrateTemplateController | null)?.data?.[link.marker];
    this.isElseIf = isString(stampedTarget) && link?.target === stampedTarget;
    const ownFactory = this.isElseIf
      ? this._effectiveFactory ??= new ElseIfViewFactory(this._factory, () => this._chainedElseFactory)
      : this._factory;

    if (prevViewModel instanceof If) {
      prevViewModel.elseFactory = ownFactory;
    } else if (prevViewModel instanceof Else) {
      if (!prevViewModel.isElseIf) {
        throw createMappedError(ErrorNames.else_without_if);
      }
      prevViewModel._chainedElseFactory = ownFactory;
    }
  }
}
