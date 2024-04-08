import { onResolve, resolve } from '@aurelia/kernel';
import { IRenderLocation, setEffectiveParentNode } from '../../dom';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { CustomAttributeStaticAuDefinition } from '../custom-attribute';
import { isPromise, isString, rethrow } from '../../utilities';
import { createLocation, insertManyBefore } from '../../utilities-dom';
import type { ControllerVisitor, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, ISyntheticView } from '../../templating/controller';
import { ErrorNames, createMappedError } from '../../errors';

export type PortalTarget = string | Element | null | undefined;
type ResolvedTarget = Element;

export type PortalLifecycleCallback = (target: PortalTarget, view: ISyntheticView) => void | Promise<void>;

export class Portal implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition<keyof Pick<
    Portal,
    'target' | 'position' | 'renderContext' | 'strict' | 'deactivating' | 'deactivated' | 'activated' | 'activating' | 'callbackContext'
  >> = {
    type: 'custom-attribute',
    name: 'portal',
    isTemplateController: true,
    bindables: [
      { name: 'target', primary: true },
      'position',
      'activated',
      'activating',
      'callbackContext',
      { name: 'renderContext', callback: 'targetChanged' },
      'strict',
      'deactivated',
      'deactivating'
    ],
    // bindables: {
    //   target: { primary: true },
    //   position: true,
    //   renderContext: { callback: 'targetChanged' },
    //   activated: true,
    //   activating: true,
    //   callbackContext: true,
    //   deactivated: true,
    //   deactivating: true,
    //   strict: true
    // }
  };

  public readonly $controller!: ICustomAttributeController<this>;

  public target: PortalTarget;

  public position: InsertPosition = 'beforeend';

  public renderContext: PortalTarget;

  public strict: boolean = false;

  public deactivating?: PortalLifecycleCallback;

  public activating?: PortalLifecycleCallback;

  public deactivated?: PortalLifecycleCallback;

  public activated?: PortalLifecycleCallback;

  public callbackContext: unknown;

  public view: ISyntheticView;

  /** @internal */ private _resolvedTarget: ResolvedTarget;
  /** @internal */ private readonly _platform: IPlatform;
  /** @internal */ private readonly _targetLocation: IRenderLocation;

  public constructor() {
    const factory = resolve(IViewFactory);
    const originalLoc = resolve(IRenderLocation);
    const p = resolve(IPlatform);
    this._platform = p;
    // to make the shape of this object consistent.
    // todo: is this necessary
    this._resolvedTarget = p.document.createElement('div');

    (this.view = factory.create()).setLocation(
      this._targetLocation = createLocation(p)
    );
    setEffectiveParentNode(this.view.nodes, originalLoc as unknown as Node);
  }

  public attaching(
    initiator: IHydratedController,
  ): void | Promise<void> {
    if (this.callbackContext == null) {
      this.callbackContext = this.$controller.scope.bindingContext;
    }
    const newTarget = this._resolvedTarget = this._getTarget();
    this._moveLocation(newTarget, this.position);

    return this._activating(initiator, newTarget);
  }

  public detaching(
    initiator: IHydratedController,
  ): void | Promise<void> {
    return this._deactivating(initiator, this._resolvedTarget);
  }

  public targetChanged(): void {
    const { $controller } = this;
    if (!$controller.isActive) {
      return;
    }

    const newTarget = this._getTarget();

    if (this._resolvedTarget === newTarget) {
      return;
    }
    this._resolvedTarget = newTarget;

    // TODO(fkleuver): fix and test possible race condition
    const ret = onResolve(
      this._deactivating(null, newTarget),
      () => {
        this._moveLocation(newTarget, this.position);
        return this._activating(null, newTarget);
      },
    );
    if (isPromise(ret)) { ret.catch(rethrow); }
  }

  public positionChanged(): void {
    const { $controller, _resolvedTarget } = this;
    if (!$controller.isActive) {
      return;
    }
    // TODO(fkleuver): fix and test possible race condition
    const ret = onResolve(
      this._deactivating(null, _resolvedTarget),
      () => {
        this._moveLocation(_resolvedTarget, this.position);
        return this._activating(null, _resolvedTarget);
      },
    );
    if (isPromise(ret)) { ret.catch(rethrow); }
  }

  /** @internal */
  private _activating(
    initiator: IHydratedController | null,
    target: ResolvedTarget,
  ): void | Promise<void> {
    const { activating, callbackContext, view } = this;

    // view.setHost(target);

    return onResolve(
      activating?.call(callbackContext, target, view),
      () => {
        return this._activate(initiator, target);
      },
    );
  }

  /** @internal */
  private _activate(
    initiator: IHydratedController | null,
    target: ResolvedTarget,
  ): void | Promise<void> {
    const { $controller, view } = this;

    if (initiator === null) {
      view.nodes.insertBefore(this._targetLocation);
    } else {
      // TODO(fkleuver): fix and test possible race condition
      return onResolve(
        view.activate(initiator ?? view, $controller, $controller.scope),
        () => {
          return this._activated(target);
        },
      );
    }

    return this._activated(target);
  }

  /** @internal */
  private _activated(
    target: ResolvedTarget,
  ): void | Promise<void> {
    const { activated, callbackContext, view } = this;

    return activated?.call(callbackContext, target, view);
  }

  /** @internal */
  private _deactivating(
    initiator: IHydratedController | null,
    target: ResolvedTarget,
  ): void | Promise<void> {
    const { deactivating, callbackContext, view } = this;

    return onResolve(
      deactivating?.call(callbackContext, target, view),
      () => {
        return this._deactivate(initiator, target);
      },
    );
  }

  /** @internal */
  private _deactivate(
    initiator: IHydratedController | null,
    target: ResolvedTarget,
  ): void | Promise<void> {
    const { $controller, view } = this;

    if (initiator === null) {
      view.nodes.remove();
    } else {
      return onResolve(
        view.deactivate(initiator, $controller),
        () => {
          return this._deactivated(target);
        },
      );
    }

    return this._deactivated(target);
  }

  /** @internal */
  private _deactivated(
    target: ResolvedTarget,
  ): void | Promise<void> {
    const { deactivated, callbackContext, view } = this;

    return onResolve(
      deactivated?.call(callbackContext, target, view),
      () => this._removeLocation()
    );
  }

  /** @internal */
  private _getTarget(): ResolvedTarget {
    const p = this._platform;
    // with a $ in front to make it less confusing/error prone
    const $document = p.document;
    let target = this.target;
    let context = this.renderContext;

    if (target === '') {
      if (this.strict) {
        throw createMappedError(ErrorNames.portal_query_empty);
      }
      return $document.body;
    }

    if (isString(target)) {
      let queryContext: ParentNode = $document;
      if (isString(context)) {
        context = $document.querySelector(context) as ResolvedTarget;
      }
      if (context instanceof p.Node) {
        queryContext = context;
      }
      target = queryContext.querySelector(target) as ResolvedTarget;
    }

    if (target instanceof p.Node) {
      return target;
    }

    if (target == null) {
      if (this.strict) {
        throw createMappedError(ErrorNames.portal_no_target);
      }
      return $document.body;
    }

    return target;
  }

  /** @internal */
  private _removeLocation(): void {
    this._targetLocation.remove();
    this._targetLocation.$start!.remove();
  }

  /** @internal */
  private _moveLocation(target: Element, position: InsertPosition) {
    const end = this._targetLocation;
    const start = end.$start!;
    const parent = target.parentNode;
    const nodes = [start, end];
    switch (position) {
      case 'beforeend':
        insertManyBefore(target, null, nodes);
        break;
      case 'afterbegin':
        insertManyBefore(target, target.firstChild, nodes);
        break;
      case 'beforebegin':
        insertManyBefore(parent, target, nodes);
        break;
      case 'afterend':
        insertManyBefore(parent, target.nextSibling, nodes);
        break;
      default:
        throw new Error('Invalid portal insertion position');
    }
  }

  public dispose(): void {
    this.view.dispose();
    this.view = (void 0)!;
    this.callbackContext = null;
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this.view?.accept(visitor) === true) {
      return true;
    }
  }
}

// templateController('portal')(Portal);
