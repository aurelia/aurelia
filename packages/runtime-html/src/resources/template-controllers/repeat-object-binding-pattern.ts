import {
  areEqual,
  type IIndexable,
  type Key,
} from '@aurelia/kernel';
import {
  type AccessScopeExpression,
  type ObjectBindingPattern,
} from '@aurelia/expression-parser';
import {
  batch,
  connectable,
  type ICollectionSubscriber,
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
  type ISubscriber,
  type Scope,
} from '@aurelia/runtime';
import { createPrototypeMixer } from '../../binding/binding-utils';
import type { IBinding } from '../../binding/interfaces-bindings';
import { ErrorNames, createMappedError } from '../../errors';
import {
  activated,
  type ISyntheticView,
} from '../../templating/controller';

/**
 * Owns the reactive, row-local projections for one repeat instance.
 *
 * The item is kept outside the binding context so replacing it does not add an
 * extra observed property to every repeated scope. Repeat already owns every
 * item-to-scope transition and can notify the active row binding directly.
 *
 * @internal
 */
export class RepeatObjectBindingPattern {
  /** @internal */ public readonly sourceKeys: readonly (string | number)[];
  /** @internal */ private readonly _localNames: readonly string[];
  /** @internal */ private readonly _sourceByScope = new WeakMap<Scope, unknown>();
  /** @internal */ private readonly _activeByScope = new WeakMap<Scope, RepeatObjectBindingPatternBinding>();
  /** @internal */ private readonly _installedViews = new WeakSet<ISyntheticView>();

  public constructor(
    pattern: ObjectBindingPattern,
    /** @internal */ public readonly observerLocator: IObserverLocator,
  ) {
    this.sourceKeys = pattern.keys;
    // parseForOfStatement admits only zero-ancestor AccessScope targets with
    // unique names. Like other renderer paths, Repeat trusts pre-parsed ASTs
    // to uphold the parser's invariant.
    this._localNames = pattern.values.map(value => (value as AccessScopeExpression).name);
    RepeatObjectBindingPatternBinding.mix();
  }

  /**
   * Records the source before its view is activated. The prepended row binding
   * performs the first projection, before any binding in the repeated body.
   *
   * @internal
   */
  public initialize(scope: Scope, source: unknown): void {
    this._sourceByScope.set(scope, source);
  }

  /** @internal */
  public setSource(scope: Scope, source: unknown): void {
    const hadSource = this._sourceByScope.has(scope);
    const oldSource = this._sourceByScope.get(scope);
    this._sourceByScope.set(scope, source);
    if (!hadSource || !areEqual(source, oldSource)) {
      this._activeByScope.get(scope)?.updateSource();
    }
  }

  /** @internal */
  public getSource(scope: Scope): unknown {
    return this._sourceByScope.get(scope);
  }

  /**
   * Expression-based repeat keys are evaluated with a temporary scope that
   * never receives a view. Materialize its locals once without subscribing.
   *
   * @internal
   */
  public projectForKey(scope: Scope): void {
    const source = this.getSource(scope);
    ensureObjectSource(source);
    const bindingContext = scope.bindingContext;
    for (let i = 0, ii = this.sourceKeys.length; i < ii; ++i) {
      bindingContext[this._localNames[i]] = (source as IIndexable)[this.sourceKeys[i]];
    }
  }

  /**
   * Installs the declaration binding once per view, including cached and
   * SSR-adopted views. It is prepended because a repeat declaration is
   * evaluated before the repeated body.
   *
   * @internal
   */
  public ensureViewBinding(view: ISyntheticView): void {
    if (this._installedViews.has(view)) {
      return;
    }
    this._installedViews.add(view);
    view.prependBinding(new RepeatObjectBindingPatternBinding(view, this));
  }

  /** @internal */
  public connect(scope: Scope, binding: RepeatObjectBindingPatternBinding): void {
    this._activeByScope.set(scope, binding);
  }

  /** @internal */
  public disconnect(scope: Scope, binding: RepeatObjectBindingPatternBinding): void {
    if (this._activeByScope.get(scope) === binding) {
      this._activeByScope.delete(scope);
    }
  }

  /** @internal */
  public get localNames(): readonly string[] {
    return this._localNames;
  }
}

interface RepeatObjectBindingPatternBinding extends IObserverLocatorBasedConnectable {}

/**
 * Connects one repeated row to the selected properties of its current item.
 *
 * This has the same one-way projection semantics as a binding-context `<let>`:
 * source changes refresh the local, while assigning the local does not write
 * through to the source object.
 */
class RepeatObjectBindingPatternBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    connectable(RepeatObjectBindingPatternBinding, null!);
  });

  public isBound: boolean = false;
  public readonly oL: IObserverLocator;

  /** @internal */ private _scope?: Scope = void 0;
  /** @internal */ private readonly _values: unknown[];

  public constructor(
    /** @internal */ private readonly _controller: ISyntheticView,
    /** @internal */ private readonly _pattern: RepeatObjectBindingPattern,
  ) {
    this.oL = _pattern.observerLocator;
    this._values = Array(_pattern.sourceKeys.length);
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) {
        return;
      }
      this.unbind();
    }

    this._scope = scope;
    this._pattern.connect(scope, this);
    try {
      this._refresh();
      this.isBound = true;
    } catch (error) {
      this._pattern.disconnect(scope, this);
      this._scope = void 0;
      this.obs.clearAll();
      throw error;
    }
  }

  public updateSource(): void {
    if (!this.isBound || this._controller.state > activated) {
      return;
    }
    this._refresh();
  }

  public handleChange(): void {
    this.updateSource();
  }

  public handleCollectionChange(): void {
    this.updateSource();
  }

  public get(key: Key) {
    return this._controller.container.get(key);
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._pattern.disconnect(this._scope!, this);
    this._scope = void 0;
    this.obs.clearAll();
  }

  /** @internal */
  private _refresh(): void {
    const scope = this._scope!;
    const pattern = this._pattern;
    const source = pattern.getSource(scope);
    ensureObjectSource(source);

    const sourceKeys = pattern.sourceKeys;
    const values = this._values;
    this.obs.version++;
    try {
      for (let i = 0, ii = sourceKeys.length; i < ii; ++i) {
        const key = sourceKeys[i];
        this.observe(source as object, key);
        values[i] = (source as IIndexable)[key];
      }
    } finally {
      this.obs.clear();
    }

    const bindingContext = scope.bindingContext;
    const localNames = pattern.localNames;
    const localCount = localNames.length;

    // On initial bind the repeated body has no subscribers yet, and a
    // single-local projection cannot expose a partial update. Avoid allocating
    // a batch record in both common cases.
    if (!this.isBound || localCount < 2) {
      publishLocals(bindingContext, localNames, values);
    } else {
      batch(() => publishLocals(bindingContext, localNames, values));
    }
  }
}

function publishLocals(
  bindingContext: IIndexable,
  localNames: readonly string[],
  values: readonly unknown[],
): void {
  for (let i = 0, ii = localNames.length; i < ii; ++i) {
    bindingContext[localNames[i]] = values[i];
  }
}

function ensureObjectSource(source: unknown): asserts source is NonNullable<unknown> {
  if (source == null) {
    throw createMappedError(ErrorNames.ast_destruct_null);
  }
}
