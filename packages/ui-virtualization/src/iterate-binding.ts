import { IContainer, type IServiceLocator, areEqual, camelCase, emptyArray, isString, registrableMetadataKey, resolve } from '@aurelia/kernel';
import { IExpressionParser, type ForOfStatement, type IsBindingBehavior } from '@aurelia/expression-parser';
import {
  astBind,
  astEvaluate,
  astUnbind,
  Collection,
  connectable,
  getCollectionObserver,
  IndexMap,
  type IAstEvaluator,
  type ICollectionSubscriber,
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
  type Scope,
} from '@aurelia/runtime';
import {
  type IBinding,
  type IBindingController,
  type IController,
  type ICustomAttributeViewModel,
  type IHydratableController,
  IPlatform,
  renderer,
  type IRenderer,
  mixinAstEvaluator,
  mixinUseScope,
} from '@aurelia/runtime-html';
import {
  AttrSyntax,
  type ICommandBuildInfo,
  IAttributeParser,
  type IInstruction,
  itMultiAttr,
  type MultiAttrInstruction,
  AttributePattern,
  BindingCommandStaticAuDefinition,
} from '@aurelia/template-compiler';

const itIterateBinding = 200;

export interface IterateBindingInstruction extends IInstruction {
  readonly type: typeof itIterateBinding;
  readonly forOf: string | ForOfStatement;
  readonly to: string;
  readonly props: MultiAttrInstruction[];
}

export interface IIterateBindingTarget extends ICustomAttributeViewModel {
  handleItemsChangeChange(items: Collection, indexMap?: IndexMap): void;
}

const wrappedExprs = [
  'BindingBehavior',
  'ValueConverter',
] as const;

export interface IterateBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {
  readonly l: IContainer;
}

interface IWrappedExpression {
  readonly expression: IsBindingBehavior;
}

export class IterateBinding implements IBinding, ICollectionSubscriber {
  public static mix = /*@__PURE__*/ (() => {
    let mixed = false;
    return () => {
      if (mixed) {
        return;
      }
      mixed = true;
      mixinUseScope(IterateBinding);
      connectable(IterateBinding, null!);
      mixinAstEvaluator(IterateBinding);
    };
  })();

  public isBound = false;

  /** @internal */ public _scope?: Scope = void 0;
  /** @internal */ public readonly oL: IObserverLocator;
  /** @internal */ private readonly _controller: IBindingController;
  /** @internal */ private _observer?: ReturnType<typeof getCollectionObserver>;
  /** @internal */ private _observingInnerItems = false;
  /** @internal */ private _reevaluating = false;
  /** @internal */ private readonly _innerItemsExpression: IsBindingBehavior | null = null;
  /** @internal */ private _items: Collection = null!;

  public constructor(
    controller: IBindingController,
    locator: IContainer,
    observerLocator: IObserverLocator,
    public readonly ast: ForOfStatement,
    public readonly target: IIterateBindingTarget,
    public readonly l: IContainer,
  ) {
    this._controller = controller;
    this.oL = observerLocator;

    let expression: IsBindingBehavior | undefined = ast.iterable;
    while (expression != null && wrappedExprs.includes(expression.$kind as typeof wrappedExprs[number])) {
      expression = (expression as IsBindingBehavior & IWrappedExpression).expression;
      this._observingInnerItems = true;
    }
    this._innerItemsExpression = expression ?? null;
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) {
        return;
      }
      this.unbind();
    }

    this._scope = scope;
    astBind(this.ast, scope, this);
    this.isBound = true;
    this._setItems(astEvaluate(this.ast, scope, this, this) as Collection);
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }

    this.isBound = false;
    astUnbind(this.ast, this._scope!, this);
    this._scope = void 0;
    this._observer?.unsubscribe(this);
    this._observer = void 0;
    this.obs.clearAll();
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }

    this.obs.version++;
    const items = astEvaluate(this.ast, this._scope!, this, this) as Collection;
    this.obs.clear();
    this._setItems(items);
  }

  public handleCollectionChange(collection: Collection, indexMap: IndexMap): void {
    if (!this.isBound) {
      return;
    }

    if (this._observingInnerItems) {
      if (this._reevaluating) {
        return;
      }
      this._reevaluating = true;
      const items = astEvaluate(this.ast, this._scope!, this, null) as Collection;
      this._reevaluating = false;
      this._setItems(items);
      return;
    }

    this._setItems(collection, indexMap);
  }

  /** @internal */
  private _setItems(items: Collection, indexMap?: IndexMap): void {
    this._items = items;
    this._refreshCollectionObserver();
    this.target.handleItemsChangeChange(items, indexMap);
  }

  /** @internal */
  private _refreshCollectionObserver(): void {
    let observingInnerItems = this._observingInnerItems;
    let observedItems = this._items;

    if (observingInnerItems && this._innerItemsExpression != null && this._scope != null) {
      const innerItems = astEvaluate(this._innerItemsExpression, this._scope, this, null) as Collection ?? null;
      observingInnerItems = this._observingInnerItems = !areEqual(this._items, innerItems);
      observedItems = observingInnerItems ? innerItems : this._items;
    }

    const newObserver = observedItems == null ? void 0 : getCollectionObserver(observedItems);
    if (this._observer !== newObserver) {
      this._observer?.unsubscribe(this);
      this._observer = newObserver;
      newObserver?.subscribe(this);
    }
  }
}

export class IterateBindingCommand {
  public static readonly $au: BindingCommandStaticAuDefinition = {
    type: 'binding-command',
    name: 'forof',
  };

  public get ignoreAttr() { return false; }

  /** @internal */
  private readonly _attrParser = resolve(IAttributeParser);

  public build(info: ICommandBuildInfo, exprParser: IExpressionParser): IterateBindingInstruction {
    const target = info.bindable === null
      ? camelCase(info.attr.target)
      : info.bindable.name;
    const forOf = exprParser.parse(info.attr.rawValue, 'IsIterator');
    let props: MultiAttrInstruction[] = emptyArray;

    if (forOf.semiIdx > -1) {
      const attrsString = info.attr.rawValue.slice(forOf.semiIdx + 1);
      const attrParts = attrsString.split(';');
      const parsedProps: MultiAttrInstruction[] = [];

      for (let j = 0, jj = attrParts.length; j < jj; j++) {
        const attrPart = attrParts[j];
        const colonIdx = attrPart.indexOf(':');
        if (colonIdx === -1) {
          continue;
        }

        const attrName = attrPart.slice(0, colonIdx).trim();
        const attrValue = attrPart.slice(colonIdx + 1).trim();
        const attrSyntax = this._attrParser.parse(attrName, attrValue);
        parsedProps.push({ type: itMultiAttr, value: attrValue, to: attrSyntax.target, command: attrSyntax.command });
      }

      props = parsedProps;
    }

    return { type: itIterateBinding, forOf, to: target, props };
  }
}

export class VirtualRepeatForAttributePattern {
  public static [Symbol.metadata] = {
    [registrableMetadataKey]: AttributePattern.create([{ pattern: 'virtual-repeat.for', symbols: '.-' }], VirtualRepeatForAttributePattern)
  };
  public 'virtual-repeat.for'(rawName: string, rawValue: string): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'virtual-repeat', 'forof');
  }
}

export const IterateBindingRenderer = /*@__PURE__*/ renderer(class IterateBindingRenderer implements IRenderer {
  public readonly target = itIterateBinding;

  public constructor() {
    IterateBinding.mix();
  }

  public render(
    renderingCtrl: IHydratableController,
    target: IController,
    instruction: IterateBindingInstruction,
    _platform: IPlatform,
    exprParser: IExpressionParser,
    observerLocator: IObserverLocator,
  ): void {
    renderingCtrl.addBinding(new IterateBinding(
      renderingCtrl,
      renderingCtrl.container,
      observerLocator,
      ensureIteratorExpression(exprParser, instruction.forOf),
      getBindingTarget(target),
      renderingCtrl.container,
    ));
  }
}, null!);

function ensureIteratorExpression(parser: IExpressionParser, srcOrExpr: string | ForOfStatement): ForOfStatement {
  return isString(srcOrExpr)
    ? parser.parse(srcOrExpr, 'IsIterator')
    : srcOrExpr;
}

function getBindingTarget(target: IController): IIterateBindingTarget {
  const maybeVm = (target as unknown as { viewModel?: object }).viewModel;
  return (maybeVm ?? target) as IIterateBindingTarget;
}
