import {
  areEqual,
  isArray,
  isPromise,
  noop,
  isMap,
  isSet,
  isNumber,
  type IDisposable,
  onResolve,
  type IIndexable,
  resolve,
  all,
  emptyArray,
  type IContainer,
} from '@aurelia/kernel';
import {
  BindingBehaviorExpression,
  type DestructuringAssignmentExpression,
  ForOfStatement,
  type IsBindingBehavior,
  ValueConverterExpression,
} from '@aurelia/expression-parser';
import {
  type Collection,
  CollectionObserver,
  getCollectionObserver,
  type IndexMap,
  createIndexMap,
  cloneIndexMap,
  astEvaluate,
  astAssign,
  Scope,
  BindingContext,
  type IOverrideContext,
} from '@aurelia/runtime';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IRenderLocation } from '../../dom';
import { IPlatform } from '../../platform';
import { IViewFactory } from '../../templating/view';
import { isSSRTemplateController, adoptSSRViews, type ISSRTemplateController } from '../../templating/ssr';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import { IController } from '../../templating/controller';
import { etIsProperty } from '../../utilities';
import { HydrateTemplateController, IInstruction, IteratorBindingInstruction } from '@aurelia/template-compiler';

import type { PropertyBinding } from '../../binding/property-binding';
import type { ISyntheticView, ICustomAttributeController, IHydratableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller';
import { ErrorNames, createMappedError } from '../../errors';
import { createInterface, singletonRegistration } from '../../utilities-di';
import { RepeatObjectBindingPattern } from './repeat-object-binding-pattern';

type Items<C extends Collection = unknown[]> = C | undefined;

type RepeatDeclaration =
  | { readonly kind: 'local'; readonly local: string }
  | { readonly kind: 'destructuring'; readonly value: DestructuringAssignmentExpression }
  | { readonly kind: 'object-binding'; readonly value: RepeatObjectBindingPattern };

interface ReconciliationWait {
  readonly promise: Promise<void>;
  readonly resolve: () => void;
  readonly reject: (reason: unknown) => void;
}

interface ReconciliationOperation {
  /** Whether one latest generation was requested while the writer was busy. */
  needsReconcile: boolean;
  /** Observer mutations composed relative to the generation the writer owns. */
  queuedIndexMap?: IndexMap;
  /** Stable tail exposed to owner teardown once reconciliation becomes async. */
  promise?: Promise<void>;
  /** Lazily created when teardown re-enters a still-synchronous writer. */
  wait?: ReconciliationWait;
}

// Row work is admitted in row order but settles concurrently. Lifecycle errors
// are selected by the lowest admitted row index after every accepted Promise
// has quiesced.
interface RowTransitionState {
  readonly promises: Promise<void>[];
  firstErrorIndex: number;
  error: unknown;
}

const createRowTransitionState = (): RowTransitionState => ({
  promises: [],
  firstErrorIndex: Number.POSITIVE_INFINITY,
  error: void 0,
});

const recordRowError = (state: RowTransitionState, index: number, error: unknown): void => {
  if (index < state.firstErrorIndex) {
    state.firstErrorIndex = index;
    state.error = error;
  }
};

const trackRowTransition = (state: RowTransitionState, index: number, promise: Promise<void>): void => {
  // Row hooks start in row order but can reject in any order. Consume each
  // rejection into the ledger so all siblings quiesce, then report the lowest
  // row index rather than the fastest rejection.
  state.promises.push(promise.then(
    noop,
    error => { recordRowError(state, index, error); },
  ));
};

const throwRowErrors = (state: RowTransitionState): void => {
  if (state.firstErrorIndex !== Number.POSITIVE_INFINITY) {
    throw state.error;
  }
};

const settleRowTransitions = (state: RowTransitionState | undefined): void | Promise<void> => {
  if (state === void 0) {
    return;
  }
  if (state.promises.length > 0) {
    // Tracked row reactions turn every rejection into a ledger entry, so
    // Promise.all is a quiescence barrier and cannot fail early.
    return Promise.all(state.promises).then(() => throwRowErrors(state));
  }
  throwRowErrors(state);
};

function dispose(disposable: IDisposable): void {
  disposable.dispose();
}

const wrappedExprs = [
  'BindingBehavior',
  'ValueConverter',
];

export class Repeat<C extends Collection = unknown[]> implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: attrTypeName,
    name: 'repeat',
    isTemplateController: true,
    defaultProperty: 'items',
    bindables: ['items'],
  };

  public views: ISyntheticView[] = [];
  public forOf!: ForOfStatement;
  public local!: string;

  public readonly $controller!: ICustomAttributeController<this>; // This is set by the controller after this instance is constructed

  public items: Items<C>;
  public key: null | string | IsBindingBehavior = null;
  public contextual: boolean = true;

  /** @internal */ private _oldViews: ISyntheticView[] = [];
  /** @internal */ private _scopes: Scope[] = [];
  /** @internal */ private _oldScopes: Scope[] = [];
  /** @internal */ private _scopeMap: Map<unknown, Scope | Scope[]> = new Map();
  /** @internal */ private _observer?: CollectionObserver = void 0;
  /** @internal */ private _innerItems: Items<C> | null;
  /** @internal */ private _forOfBinding!: PropertyBinding;
  /** @internal */ private _observingInnerItems: boolean = false;
  /** @internal */ private _reevaluating: boolean = false;
  /** @internal */ private _innerItemsExpression: IsBindingBehavior | null = null;
  /** @internal */ private _normalizedItems?: unknown[] = void 0;
  /** @internal */ private _declaration!: RepeatDeclaration;
  /** @internal */ private _objectBindingPattern?: RepeatObjectBindingPattern = void 0;
  /** @internal */ private readonly _contextualExpr?: IsBindingBehavior;
  /** @internal */ private _isReconciling: boolean = false;
  // Keep synchronous reconciliation allocation-free. The operation record is
  // created only when a row yields, a notification re-enters, or teardown needs
  // a Promise representing work that began synchronously.
  /** @internal */ private _reconciliation?: ReconciliationOperation = void 0;

  // SSR-adopted and later ordinary rows may coexist. Provenance therefore
  // belongs to each view; a single owner-wide boolean would misroute caching.
  /** @internal */ private _adoptedViews?: Set<ISyntheticView> = void 0;

  /** @internal */ private readonly _location = resolve(IRenderLocation);
  /** @internal */ private readonly _parent = resolve(IController) as IHydratableController;
  /** @internal */ private readonly _factory = resolve(IViewFactory);
  /** @internal */ private readonly _resolver = resolve(IRepeatableHandlerResolver);
  /** @internal */ private readonly _platform = resolve(IPlatform);

  public constructor() {
    const instruction = resolve(IInstruction) as HydrateTemplateController;
    const iteratorProps = (instruction.props[0] as IteratorBindingInstruction).props;

    for (let i = 0, ii = iteratorProps.length; i < ii; ++i) {
      const prop = iteratorProps[i];
      const { to, value, command } = prop;
      if (to === 'key') {
        if (command === null) {
          this.key = value as string;
        } else if (command === 'bind') {
          // AOT: value is pre-parsed AST; JIT: value is string to parse
          this.key = typeof value === 'string'
            ? resolve(IExpressionParser).parse(value, etIsProperty)
            : value;
        } else {
          throw createMappedError(ErrorNames.repeat_invalid_key_binding_command, command);
        }
      } else if (to === 'contextual') {
        if (command === null) {
          // Static value: contextual: true | false
          // When command is null, value is always a string
          this.contextual = value === 'false' ? false : !!value;
        } else if (command === 'bind') {
          // Expression: contextual.bind: someExpression (evaluated once at bind)
          // AOT: value is pre-parsed AST; JIT: value is string to parse
          this._contextualExpr = typeof value === 'string'
            ? resolve(IExpressionParser).parse(value, etIsProperty)
            : value;
        } else {
          throw createMappedError(ErrorNames.repeat_invalid_contextual_binding_command, command);
        }
      } else {
        throw createMappedError(ErrorNames.repeat_extraneous_binding, to);
      }
    }
  }

  public binding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    const bindings = this._parent.bindings as PropertyBinding[];
    const ii = bindings.length;
    let binding: PropertyBinding = (void 0)!;
    let forOf!: ForOfStatement;
    let i = 0;
    for (; ii > i; ++i) {
      binding = bindings[i];
      if (binding.target === this && binding.targetProperty === 'items') {
        forOf = this.forOf = binding.ast as ForOfStatement;
        this._forOfBinding = binding;

        let expression = forOf.iterable;
        while (expression != null && wrappedExprs.includes(expression.$kind)) {
          expression = (expression as ValueConverterExpression | BindingBehaviorExpression).expression;
          this._observingInnerItems = true;
        }
        this._innerItemsExpression = expression;

        break;
      }
    }

    this._refreshCollectionObserver();
    const dec = forOf.declaration;
    switch (dec.$kind) {
      case 'ArrayDestructuring':
      case 'ObjectDestructuring':
        // These pre-lowered assignment ASTs retain their existing one-shot
        // astAssign path. Current object repeat syntax produces the binding
        // pattern handled by the live projection below.
        this._declaration = { kind: 'destructuring', value: dec };
        break;
      case 'ObjectBindingPattern':
        this._declaration = {
          kind: 'object-binding',
          value: this._objectBindingPattern ??= new RepeatObjectBindingPattern(
            dec,
            binding.oL,
          ),
        };
        break;
      default: {
        const local = this.local = astEvaluate(dec, this.$controller.scope, binding, null) as string;
        this._declaration = { kind: 'local', local };
      }
    }

    // Evaluate contextual.bind expression if present (one-time evaluation at bind)
    if (this._contextualExpr !== void 0) {
      const result = astEvaluate(this._contextualExpr, this.$controller.scope, binding, null);
      this.contextual = result != null && result !== false;
    }
  }

  public attaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    if (this.views.length > 0) {
      // Repeat rebuilds its row graph when an owner is restarted. The previous
      // Controller operation is fully settled at this point, so dispose every
      // retained ordinary or adopted row before replacing the views array.
      const cleanup = createRowTransitionState();
      for (let i = 0; i < this.views.length; ++i) {
        this._disposeRow(this.views[i], i, cleanup);
      }
      this.views = [];
      this._adoptedViews = void 0;
      throwRowErrors(cleanup);
    }
    return this._beginReconciliation(() => {
      this._normalizeToArray();
      this._createScopes(void 0);
      return this._activateAllViews(initiator, this._normalizedItems ?? emptyArray);
    });
  }

  public detaching(
    initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._refreshCollectionObserver();
    let reconciliation = this._reconciliation?.promise;
    if (reconciliation === void 0 && this._isReconciling) {
      // Teardown can re-enter before a synchronous row transition returns. A
      // lazy wait keeps that transition owned without allocating on normal
      // synchronous updates.
      const operation = this._reconciliation ??= { needsReconcile: false };
      let wait = operation.wait;
      if (wait === void 0) {
        let resolve!: () => void;
        let reject!: (reason: unknown) => void;
        const promise = new Promise<void>((res, rej) => {
          resolve = res;
          reject = rej;
        });
        wait = operation.wait = { promise, resolve, reject };
      }
      reconciliation = wait.promise;
    }

    if (reconciliation === void 0) {
      return this._deactivateOwnedViews(initiator);
    }
    return reconciliation.then(() => this._deactivateOwnedViews(initiator));
  }

  public unbinding(
    _initiator: IHydratedController,
    _parent: IHydratedParentController,
  ): void | Promise<void> {
    this._scopeMap.clear();
  }

  // called by SetterObserver
  public itemsChanged(): void {
    if (!this.$controller.isActive) {
      return;
    }
    this._refreshCollectionObserver();
    this._requestReconcile(void 0);
  }

  public handleCollectionChange(collection: Collection, indexMap: IndexMap | undefined): void {
    const $controller = this.$controller;
    if (!$controller.isActive) {
      return;
    }
    if (this._observingInnerItems) {
      if (this._reevaluating) {
        return;
      }
      this._reevaluating = true;
      this.items = astEvaluate(this.forOf.iterable, $controller.scope, this._forOfBinding, null) as Items<C>;
      this._reevaluating = false;
      return;
    }

    this._requestReconcile(indexMap);
  }

  /** @internal */
  private _requestReconcile(indexMap: IndexMap | undefined): void {
    if (this._isReconciling) {
      this._queueReconcile(indexMap);
      return;
    }

    // Notification callbacks cannot return asynchronous settlement. The stable
    // drain remains on the operation record for owner teardown and diagnostics;
    // an otherwise unobserved rejection retains the existing host behavior.
    void this._beginReconciliation(() => this._performReconcile(indexMap));
  }

  /** @internal */
  private _queueReconcile(indexMap: IndexMap | undefined): void {
    const operation = this._reconciliation ??= { needsReconcile: false };
    if (this.key !== null || indexMap === void 0) {
      // Keyed and replacement changes cannot be composed from observer indices;
      // recompute them from the latest collection after the current writer.
      operation.needsReconcile = true;
      operation.queuedIndexMap = void 0;
      return;
    }

    if (!operation.needsReconcile) {
      operation.needsReconcile = true;
      // The observer owns its IndexMap and may reuse it after notification.
      // Clone before retaining it across an asynchronous row lifecycle.
      operation.queuedIndexMap = cloneIndexMap(indexMap);
      return;
    }

    const previous = operation.queuedIndexMap;
    if (previous === void 0) {
      return;
    }

    // Both maps are relative to consecutive collections. Compose them back to
    // the generation currently owned by the single writer.
    operation.queuedIndexMap = composeIndexMaps(previous, indexMap);
  }

  /** @internal */
  private _beginReconciliation(action: () => void | Promise<void>): void | Promise<void> {
    this._isReconciling = true;

    let result: void | Promise<void>;
    try {
      result = action();
    } catch (error) {
      this._resetReconciliation(error, true);
      throw error;
    }

    if (isPromise(result)) {
      const operation = this._reconciliation ??= { needsReconcile: false };
      return operation.promise = this._awaitReconciliation(result);
    }

    const reconciliation = this._drainReconciliation();
    if (isPromise(reconciliation)) {
      // As above, an async drain proves a queued operation already exists.
      this._reconciliation!.promise = reconciliation;
    }
    return reconciliation;
  }

  /** @internal */
  private _performReconcile(indexMap: IndexMap | undefined): void | Promise<void> {
    this._normalizeToArray();
    this._createScopes(this.key === null ? indexMap : void 0);
    return this._applyIndexMap(indexMap);
  }

  /** @internal */
  private _awaitReconciliation(
    result: Promise<void>,
  ): Promise<void> {
    return result.then(
      () => this._drainReconciliation(),
      error => {
        this._resetReconciliation(error, true);
        throw error;
      },
    );
  }

  /** @internal */
  private _drainReconciliation(): void | Promise<void> {
    let operation = this._reconciliation;
    while (operation?.needsReconcile === true && this.$controller.isActive) {
      const indexMap = operation.queuedIndexMap;
      operation.needsReconcile = false;
      operation.queuedIndexMap = void 0;

      let result: void | Promise<void>;
      try {
        result = this._performReconcile(indexMap);
      } catch (error) {
        this._resetReconciliation(error, true);
        throw error;
      }

      if (isPromise(result)) {
        return this._awaitReconciliation(result);
      }
      operation = this._reconciliation;
    }

    this._resetReconciliation(void 0, false);
  }

  /** @internal */
  private _deactivateOwnedViews(initiator: IHydratedController): void {
    // Rows stay owned until Repeat is disposed or restarted. Disposing inside
    // this hook would race the ancestor Controller's linked-list cleanup, which
    // still needs their nodes and bindings; attaching disposes the settled graph
    // before rebuilding it.
    this._deactivateAllViews(initiator);
  }

  /** @internal */
  private _resetReconciliation(error: unknown, failed: boolean): void {
    const wait = this._reconciliation?.wait;
    this._reconciliation = void 0;
    this._isReconciling = false;
    if (wait !== void 0) {
      // `failed` cannot be inferred from `error`: undefined is a valid raw
      // rejection value that must still reject the lazy owner wait.
      if (failed) {
        wait.reject(error);
      } else {
        wait.resolve();
      }
    }
  }

  /** @internal */
  private _applyIndexMap(indexMap: IndexMap | undefined): void | Promise<void> {
    const oldViews = this.views;
    this._oldViews = oldViews.slice();
    const oldLen = oldViews.length;
    const hasKey = this.key !== null;

    const oldScopes = this._oldScopes;
    const newScopes = this._scopes;

    if (hasKey || indexMap === void 0) {
      const binding = this._forOfBinding;
      const declaration = this._declaration;
      const newLen = newScopes.length;
      indexMap = createIndexMap(newLen);

      if (oldLen === 0) {
        // Only add new views
        for (let i = 0; i < newLen; ++i) {
          indexMap[i] = -2;
        }
      } else if (newLen === 0) {
        // Only remove old views
        for (let i = 0; i < oldLen; ++i) {
          indexMap.deletedIndices.push(i);
          indexMap.deletedItems.push(getItem(declaration, oldScopes[i], binding));
        }
      } else {
        // O(n) matching via scope identity.
        // _createScopes already matched by key (or item identity), reusing old Scope objects.
        // So newScopes[i] === oldScopes[j] iff the key/item at new position i came from old position j.
        const oldScopeToIndex = new Map<Scope, number>();
        for (let i = 0; i < oldLen; ++i) {
          oldScopeToIndex.set(oldScopes[i], i);
        }

        const usedOldIndices = new Set<number>();
        for (let i = 0; i < newLen; ++i) {
          const oldIdx = oldScopeToIndex.get(newScopes[i]);
          if (oldIdx !== void 0) {
            indexMap[i] = oldIdx;
            usedOldIndices.add(oldIdx);
          } else {
            indexMap[i] = -2;
          }
        }

        // Collect deletions in ascending order
        for (let i = 0; i < oldLen; ++i) {
          if (!usedOldIndices.has(i)) {
            indexMap.deletedIndices.push(i);
            indexMap.deletedItems.push(getItem(declaration, oldScopes[i], binding));
          }
        }
      }
    }

    // first detach+unbind+(remove from array) the deleted view indices
    if (indexMap.deletedIndices.length > 0) {
      const complete = () => this.$controller.isActive
        ? this._createAndActivateAndSortViewsByKey(indexMap)
        : void 0;
      return onResolve(this._deactivateAndRemoveViewsByKey(indexMap), complete);
    }

    return this._createAndActivateAndSortViewsByKey(indexMap);
  }

  // todo: subscribe to collection from inner expression
  /** @internal */
  private _refreshCollectionObserver(): void {
    const scope = this.$controller.scope;

    let innerItems = this._innerItems;
    let observingInnerItems = this._observingInnerItems;
    let newObserver: CollectionObserver | undefined;

    if (observingInnerItems) {
      innerItems = this._innerItems = astEvaluate(this._innerItemsExpression!, scope, this._forOfBinding, null) as Items<C> ?? null;
      observingInnerItems = this._observingInnerItems = !areEqual(this.items, innerItems);
    }

    const oldObserver = this._observer;
    if (this.$controller.isActive) {
      const items = observingInnerItems ? innerItems : this.items;
      newObserver = this._observer = this._resolver.resolve(items).getObserver?.(items);
      if (oldObserver !== newObserver) {
        oldObserver?.unsubscribe(this);
        newObserver?.subscribe(this);
      }
    } else {
      oldObserver?.unsubscribe(this);
      this._observer = undefined;
    }
  }

  /** @internal */
  private _createScopes(indexMap: IndexMap | undefined): void {
    const oldScopes = this._scopes;
    this._oldScopes = oldScopes.slice();

    const items = this._normalizedItems!;
    const len = items.length;
    const scopes = this._scopes = Array<Scope>(len);

    const oldScopeMap = this._scopeMap;
    const newScopeMap = new Map<unknown, Scope | Scope[]>();
    const parentScope = this.$controller.scope;
    const binding = this._forOfBinding;
    const declaration = this._declaration;

    if (indexMap === void 0) {
      const key = this.key;
      const hasKey = key !== null;
      if (hasKey) {
        const keys = Array<unknown>(len);
        if (typeof key === 'string') {
          for (let i = 0; i < len; ++i) {
            keys[i] = (items[i] as IIndexable)[key];
          }
        } else {
          for (let i = 0; i < len; ++i) {
            // This method of creating a throwaway scope just for key evaluation is inefficient but requires a lot less code this way.
            // It seems acceptable for what should be a niche use case and this way it's guaranteed to work correctly in all cases.
            // When performance matters, it is advised to use normal string-based keys instead of expressions:
            // `repeat.for="i of items; key.bind: i.key" - inefficient
            // `repeat.for="i of items; key: key" - efficient
            const scope = createScope(items[i], declaration, parentScope, binding);
            setItem(declaration, scope, binding, items[i]);
            if (declaration.kind === 'object-binding') {
              declaration.value.projectForKey(scope);
            }
            keys[i] = astEvaluate(key, scope, binding, null);
          }
        }
        for (let i = 0; i < len; ++i) {
          scopes[i] = getScope(oldScopeMap, newScopeMap, keys[i], items[i], declaration, parentScope, binding);
        }
      } else {
        for (let i = 0; i < len; ++i) {
          scopes[i] = getScope(oldScopeMap, newScopeMap, items[i], items[i], declaration, parentScope, binding);
        }
      }
    } else {
      const oldLen = oldScopes.length;
      for (let i = 0; i < len; ++i) {
        const src = indexMap[i];

        if (src >= 0 && src < oldLen) {
          scopes[i] = oldScopes[src];
        } else {
          scopes[i] = createScope(items[i], declaration, parentScope, binding);
        }
        setItem(declaration, scopes[i], binding, items[i]);
      }
    }

    oldScopeMap.clear();
    this._scopeMap = newScopeMap;
  }

  /** @internal */
  private _normalizeToArray(): void {
    const items = this.items;
    if (isArray(items)) {
      this._normalizedItems = items.slice(0);
      return;
    }
    const normalizedItems: unknown[] = [];

    this._resolver.resolve(items).iterate(items, (item, index) => {
      normalizedItems[index] = item;
    });
    this._normalizedItems = normalizedItems;
  }

  /** @internal */
  private _activateAllViews(
    initiator: IHydratedController,
    $items: unknown[],
  ): void | Promise<void> {
    // SSR hydration: adopt existing DOM instead of creating new views.
    // _hydrateViews clears ssrScope, so reactivation takes the normal path.
    const ssrScope = this.$controller.ssrScope;
    if (ssrScope != null && isSSRTemplateController(ssrScope) && ssrScope.type === 'repeat') {
      return this._hydrateViews(initiator, $items, ssrScope);
    }

    return this._activateAllViewsFresh(initiator, $items);
  }

  // SSR hydration adopts existing DOM nodes instead of creating new ones.
  private _hydrateViews(
    initiator: IHydratedController,
    $items: unknown[],
    ssrScope: ISSRTemplateController,
  ): void | Promise<void> {
    const { $controller, _factory, _location, _scopes, _platform } = this;
    const newLen = $items.length;
    const { views: adoptedViews } = adoptSSRViews(ssrScope, _factory, $controller, _location, _platform);

    if (adoptedViews.length === 0) {
      $controller.ssrScope = undefined;
      return this._activateAllViewsFresh(initiator, $items);
    }

    this._adoptedViews = new Set(adoptedViews);
    this.views = adoptedViews;

    let transition: RowTransitionState | undefined;
    for (let i = 0; i < newLen; ++i) {
      const view = adoptedViews[i];
      const scope = _scopes[i];
      if (this._declaration.kind === 'object-binding') {
        this._declaration.value.ensureViewBinding(view);
      }

      if (this.contextual) {
        setContextualProperties(scope.overrideContext as RepeatOverrideContext, i, newLen, $items);
      }

      const result = view.activate(initiator, $controller, scope);
      if (isPromise(result)) {
        const state = transition ??= createRowTransitionState();
        trackRowTransition(state, i, result);
      }
    }

    $controller.ssrScope = undefined;

    // Repeat needs a local drain in addition to Controller's ancestor ownership:
    // collection notifications can arrive before the ancestor operation settles
    // and must queue behind the initial row generation.
    return settleRowTransitions(transition);
  }

  /** @internal */
  private _activateAllViewsFresh(
    initiator: IHydratedController,
    $items: unknown[],
  ): void | Promise<void> {
    const { $controller, _factory, _location, _scopes } = this;
    const newLen = $items.length;
    const views = this.views = Array(newLen);

    let transition: RowTransitionState | undefined;
    for (let i = 0; i < newLen; ++i) {
      const view = views[i] = _factory.create($controller).setLocation(_location);
      if (this._declaration.kind === 'object-binding') {
        this._declaration.value.ensureViewBinding(view);
      }
      view.nodes.unlink();
      const scope = _scopes[i];

      if (this.contextual) {
        setContextualProperties(scope.overrideContext as RepeatOverrideContext, i, newLen, $items);
      }

      const result = view.activate(initiator, $controller, scope);
      if (isPromise(result)) {
        const state = transition ??= createRowTransitionState();
        trackRowTransition(state, i, result);
      }
    }

    return settleRowTransitions(transition);
  }

  /** @internal */
  private _deactivateAllViews(initiator: IHydratedController): void {
    const { views, $controller, _adoptedViews } = this;
    // A synchronous lifecycle hook may mutate the observed collection. Teardown
    // owns the row set accepted at entry, not whatever length is visible later.
    const length = views.length;
    for (let i = 0; i < length; ++i) {
      const view = views[i];
      if (_adoptedViews?.has(view) !== true) {
        view.release();
      }
      // Controller enrolls descendant work in the ancestor initiator and
      // therefore returns no local Promise here. Repeat must not create a
      // second owner for that same work.
      void view.deactivate(initiator, $controller);
    }
  }

  /** @internal */
  private _deactivateAndRemoveViewsByKey(
    indexMap: IndexMap,
  ): void | Promise<void> {
    let transition: RowTransitionState | undefined;

    const { $controller, views, _adoptedViews } = this;

    const deleted = indexMap.deletedIndices.slice().sort(compareNumber);
    const deletedLen = deleted.length;
    for (let i = 0; i < deletedLen; ++i) {
      const rowIndex = deleted[i];
      const view = views[rowIndex];
      const shouldDispose = _adoptedViews?.delete(view) === true;
      if (!shouldDispose) {
        view.release();
      }
      let result: void | Promise<void>;
      try {
        result = view.deactivate(view, $controller);
      } catch (error) {
        const state = transition ??= createRowTransitionState();
        recordRowError(state, rowIndex, error);
        break;
      }
      if (isPromise(result)) {
        const state = transition ??= createRowTransitionState();
        this._trackRowTeardown(state, rowIndex, view, result, shouldDispose);
      } else if (shouldDispose) {
        this._disposeRow(view, rowIndex, transition ??= createRowTransitionState());
      }
    }

    for (let i = 0; i < deletedLen; ++i) {
      views.splice(deleted[i] - i, 1);
    }

    return settleRowTransitions(transition);
  }

  /** @internal */
  private _trackRowTeardown(
    state: RowTransitionState,
    index: number,
    view: ISyntheticView,
    result: Promise<void>,
    disposeOnSuccess: boolean,
  ): void {
    // Convert both reactions into fulfilled ledger entries. Promise.all below is
    // therefore a quiescence barrier; row rejection timing cannot bypass sibling
    // cleanup or choose which row error becomes public.
    state.promises.push(result.then(
      () => {
        if (disposeOnSuccess) {
          this._disposeRow(view, index, state);
        }
      },
      error => {
        recordRowError(state, index, error);
      },
    ));
  }

  /** @internal */
  private _disposeRow(view: ISyntheticView, index: number, state: RowTransitionState): void {
    try {
      view.dispose();
    } catch (error) {
      recordRowError(state, index, error);
    }
  }

  /** @internal */
  private _createAndActivateAndSortViewsByKey(
    indexMap: IndexMap,
  ): void | Promise<void> {
    let transition: RowTransitionState | undefined;
    let ret: void | Promise<void>;
    let view: ISyntheticView;
    let i = 0;

    const { $controller, _factory, _location, views, _scopes, _oldViews } = this;
    const newLen = indexMap.length;

    for (; newLen > i; ++i) {
      if (indexMap[i] === -2) {
        view = _factory.create($controller);
        if (this._declaration.kind === 'object-binding') {
          this._declaration.value.ensureViewBinding(view);
        }
        views.splice(i, 0, view);
      }
    }

    if (views.length !== newLen) {
      throw createMappedError(ErrorNames.repeat_mismatch_length, [views.length, newLen]);
    }

    let source = 0;
    i = 0;
    for (; i < indexMap.length; ++i) {
      if ((source = indexMap[i]) !== -2) {
        views[i] = _oldViews[source];
      }
    }

    // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
    // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
    const seq = longestIncreasingSubsequence(indexMap);
    const seqLen = seq.length;

    let next: ISyntheticView | undefined;
    let j = seqLen - 1;
    i = newLen - 1;
    for (; i >= 0; --i) {
      view = views[i];

      if (this.contextual) {
        setContextualProperties(_scopes[i].overrideContext as RepeatOverrideContext, i, newLen, this._normalizedItems);
      }

      if (indexMap[i] === -2) {
        view.nodes.link(next?.nodes ?? _location);
        view.setLocation(_location);
        try {
          ret = view.activate(view, $controller, _scopes[i]);
        } catch (error) {
          recordRowError(transition ??= createRowTransitionState(), i, error);
          break;
        }
        if (isPromise(ret)) {
          const state = transition ??= createRowTransitionState();
          trackRowTransition(state, i, ret);
        }
      } else if (j < 0 || i !== seq[j]) {
        view.nodes.link(next?.nodes ?? _location);
        view.nodes.insertBefore(view.location!);
      } else {
        --j;
      }
      next = view;
    }

    return settleRowTransitions(transition);
  }

  public dispose(): void {
    this.views.forEach(dispose);
    this.views = (void 0)!;
    this._adoptedViews = void 0;
  }

  public accept(visitor: ControllerVisitor): void | true {
    const { views } = this;

    if (views !== void 0) {
      for (let i = 0, ii = views.length; i < ii; ++i) {
        const result = views[i].accept(visitor);
        if (result === true) {
          return true;
        }
      }
    }
  }
}

let maxLen = 16;
let prevIndices = new Int32Array(maxLen);
let tailIndices = new Int32Array(maxLen);

/**
 * Compose two observer maps that describe consecutive collection mutations.
 * The result maps the latest collection directly back to the collection owned
 * by the in-flight reconciliation.
 *
 * @internal
 */
function composeIndexMaps(previous: IndexMap, current: IndexMap): IndexMap {
  const composed = createIndexMap(current.length);
  let i = 0;
  for (; i < current.length; ++i) {
    const source = current[i];
    composed[i] = source < 0 ? source : previous[source];
  }

  for (i = 0; i < previous.deletedIndices.length; ++i) {
    composed.deletedIndices.push(previous.deletedIndices[i]);
    composed.deletedItems.push(previous.deletedItems[i]);
  }
  for (i = 0; i < current.deletedIndices.length; ++i) {
    const source = previous[current.deletedIndices[i]];
    if (source >= 0) {
      composed.deletedIndices.push(source);
      composed.deletedItems.push(current.deletedItems[i]);
    }
  }
  return composed;
}

// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
export function longestIncreasingSubsequence(indexMap: IndexMap): Int32Array {
  const len = indexMap.length;

  if (len > maxLen) {
    maxLen = len;
    prevIndices = new Int32Array(len);
    tailIndices = new Int32Array(len);
  }

  let cursor = 0;
  let cur = 0;
  let prev = 0;
  let i = 0;
  let j = 0;
  let low = 0;
  let high = 0;
  let mid = 0;

  for (; i < len; i++) {
    cur = indexMap[i];
    if (cur !== -2) {
      j = prevIndices[cursor];

      prev = indexMap[j];
      if (prev !== -2 && prev < cur) {
        tailIndices[i] = j;
        prevIndices[++cursor] = i;
        continue;
      }

      low = 0;
      high = cursor;

      while (low < high) {
        mid = (low + high) >> 1;
        prev = indexMap[prevIndices[mid]];
        if (prev !== -2 && prev < cur) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      prev = indexMap[prevIndices[low]];
      if (cur < prev || prev === -2) {
        if (low > 0) {
          tailIndices[i] = prevIndices[low - 1];
        }
        prevIndices[low] = i;
      }
    }
  }
  i = ++cursor;
  const result = new Int32Array(i);
  cur = prevIndices[cursor - 1];

  while (cursor-- > 0) {
    result[cursor] = cur;
    cur = tailIndices[cur];
  }
  while (i-- > 0) prevIndices[i] = 0;
  return result;
}

// Keep expression-parser's reservedObjectBindingPatternLocalNames in sync when
// adding contextual properties: these names take precedence over row locals.
interface IRepeatOverrideContext extends IOverrideContext {
  $index: number;
  $odd: boolean;
  $even: boolean;
  $first: boolean;
  $middle: boolean;
  $last: boolean;
  $length: number; // new in v2, there are a few requests, not sure if it should stay
  __items__?: unknown[]; // opt-in: the array being iterated (undefined when disabled)
  $previous?: unknown; // opt-in: previous iteration's item (null for first, undefined when disabled)
}

class RepeatOverrideContext implements IRepeatOverrideContext {
  public get $odd(): boolean {
    return !this.$even;
  }
  public get $even(): boolean {
    return this.$index % 2 === 0;
  }
  public get $first(): boolean {
    return this.$index === 0;
  }
  public get $middle(): boolean {
    return !this.$first && !this.$last;
  }
  public get $last(): boolean {
    return this.$index === this.$length - 1;
  }
  public get $previous(): unknown {
    return this.__items__?.[this.$index - 1];
  }

  public constructor(
    public readonly $index: number = 0,
    public readonly $length: number = 1,
    // maybe at some point we can turn this into $items
    // to indicate a normalised array of any collection
    public readonly __items__: unknown[] | undefined = undefined,
  ) {}
}

const setContextualProperties = (oc: IRepeatOverrideContext, index: number, length: number, items: unknown[] | undefined): void => {
  oc.$index = index;
  oc.$length = length;
  oc.__items__ = items;
};

export const IRepeatableHandlerResolver = /*@__PURE__*/ createInterface<IRepeatableHandlerResolver>(
  'IRepeatableHandlerResolver',
  x => x.singleton(RepeatableHandlerResolver)
);
/**
 * An interface describings the capabilities of a repeatable handler.
 */
export interface IRepeatableHandlerResolver {
  resolve(value: unknown): IRepeatableHandler;
}

/**
 * The default implementation of the IRepeatableHandlerResolver interface
 */
class RepeatableHandlerResolver implements IRepeatableHandlerResolver {
  /** @internal */
  private readonly _handlers = resolve(all(IRepeatableHandler));

  public resolve(value: Repeatable): IRepeatableHandler {
    if (_arrayHandler.handles(value)) {
      return _arrayHandler;
    }
    if (_setHandler.handles(value)) {
      return _setHandler;
    }
    if (_mapHandler.handles(value)) {
      return _mapHandler;
    }
    if (_numberHandler.handles(value)) {
      return _numberHandler;
    }
    if (_nullishHandler.handles(value)) {
      return _nullishHandler;
    }
    const handler = this._handlers.find(x => x.handles(value));
    if (handler !== void 0) {
      return handler;
    }
    return _unknownHandler;
  }
}

/**
 * A simple implementation for handling common array like values, such as:
 * - HTMLCollection
 * - NodeList
 * - FileList,
 * - etc...
 */
export class ArrayLikeHandler implements IRepeatableHandler<ArrayLike<unknown>> {
  public static register(c: IContainer) {
    c.register(singletonRegistration(IRepeatableHandler, this));
  }

  public handles(value: NonNullable<unknown>): boolean {
    return 'length' in value && isNumber(value.length);
  }

  public iterate(items: ArrayLike<unknown>, func: (item: unknown, index: number, arr: ArrayLike<unknown>) => void): void {
    for (let i = 0, ii = items.length; i < ii; ++i) {
      func(items[i], i, items);
    }
  }

}

/**
 * An interface describing a repeatable value handler
 */
export const IRepeatableHandler = /*@__PURE__*/ createInterface<IRepeatableHandler>('IRepeatableHandler');

export interface IRepeatableHandler<TValue extends Repeatable = Repeatable> {
  handles(value: unknown): boolean;
  getObserver?(value: TValue): CollectionObserver | undefined;
  iterate(value: TValue, func: (item: unknown, index: number, value: TValue) => void): void;
  // getCount(items: TValue): number;
}

const _arrayHandler: IRepeatableHandler<unknown[]> = {
  handles: isArray,
  getObserver: getCollectionObserver,
  /* istanbul ignore next */
  iterate(value, func): void {
    const ii = value.length;
    let i = 0;
    for (; i < ii; ++i) {
      func(value[i], i, value);
    }
  },
  // getCount: items => items.length,
};

const _setHandler: IRepeatableHandler<Set<unknown>> = {
  handles: isSet,
  getObserver: getCollectionObserver,
  iterate(value, func): void {
    let i = 0;
    let key: unknown;
    for (key of value.keys()) {
      func(key, i++, value);
    }
  },
  // getCount: s => s.size,
};

const _mapHandler: IRepeatableHandler<Map<unknown, unknown>> = {
  handles: isMap,
  getObserver: getCollectionObserver,
  iterate(value, func): void {
    let i = 0;
    let entry: [unknown, unknown] | undefined;
    for (entry of value.entries()) {
      func(entry, i++, value);
    }
  },
  // getCount: s => s.size,
};

const _numberHandler: IRepeatableHandler<number> = {
  handles: isNumber,
  iterate(value, func): void {
    let i = 0;
    for (; i < value; ++i) {
      func(i, i, value);
    }
  },
  // getCount: v => v,
};

const _nullishHandler: IRepeatableHandler<null | undefined> = {
  handles: v => v == null,
  iterate() {/* do nothing */},
  // getCount: () => 0,
};

const _unknownHandler: IRepeatableHandler = {
  handles(_value: unknown): boolean {
    // Should only return as an explicit last fallback
    return false;
  },
  iterate(value: Repeatable, _func: (item: unknown, index: number, value: Repeatable) => void): void {
    throw createMappedError(ErrorNames.repeat_non_iterable, value);
  },
  // getCount: () => 0,
};

type Repeatable = Collection | ArrayLike<unknown> | number | null | undefined;

const setItem = (
  declaration: RepeatDeclaration,
  scope: Scope,
  binding: PropertyBinding,
  item: unknown,
) => {
  switch (declaration.kind) {
    case 'local':
      scope.bindingContext[declaration.local] = item;
      break;
    case 'destructuring':
      astAssign(declaration.value, scope, binding, null, item);
      break;
    case 'object-binding':
      declaration.value.setSource(scope, item);
      break;
  }
};

const getItem = (
  declaration: RepeatDeclaration,
  scope: Scope,
  binding: PropertyBinding,
): unknown => {
  switch (declaration.kind) {
    case 'local':
      return scope.bindingContext[declaration.local];
    case 'destructuring':
      return astEvaluate(declaration.value, scope, binding, null);
    case 'object-binding':
      return declaration.value.getSource(scope);
  }
};

const getScope = (
  oldScopeMap: Map<unknown, Scope | Scope[]>,
  newScopeMap: Map<unknown, Scope | Scope[]>,
  key: unknown,
  item: unknown,
  declaration: RepeatDeclaration,
  parentScope: Scope,
  binding: PropertyBinding,
) => {
  let scope = oldScopeMap.get(key);
  if (scope === void 0) {
    scope = createScope(item, declaration, parentScope, binding);
  } else if (scope instanceof Scope) {
    oldScopeMap.delete(key);
  } else if (scope.length === 1) {
    scope = scope[0];
    oldScopeMap.delete(key);
  } else {
    scope = scope.shift()!;
  }

  if (newScopeMap.has(key)) {
    const entry = newScopeMap.get(key)!;
    if (entry instanceof Scope) {
      newScopeMap.set(key, [entry, scope]);
    } else {
      entry.push(scope);
    }
  } else {
    newScopeMap.set(key, scope);
  }
  setItem(declaration, scope, binding, item);
  return scope;
};

const createScope = (
  item: unknown,
  declaration: RepeatDeclaration,
  parentScope: Scope,
  binding: PropertyBinding,
) => {
  if (declaration.kind === 'local') {
    return Scope.fromParent(
      parentScope,
      new BindingContext(declaration.local, item),
      new RepeatOverrideContext(),
    );
  }

  const scope = Scope.fromParent(parentScope, new BindingContext(), new RepeatOverrideContext());
  if (declaration.kind === 'destructuring') {
    astAssign(declaration.value, scope, binding, null, item);
  } else {
    declaration.value.initialize(scope, item);
  }
  return scope;
};

const compareNumber = (a: number, b: number): number => a - b;
