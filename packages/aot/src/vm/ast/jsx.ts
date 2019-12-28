import {
  JsxAttribute,
  JsxAttributes,
  JsxChild,
  JsxClosingElement,
  JsxClosingFragment,
  JsxElement,
  JsxExpression,
  JsxFragment,
  JsxOpeningElement,
  JsxOpeningFragment,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  JsxTagNameExpression,
  JsxText,
  Node,
  SyntaxKind,
  JsxAttributeLike,
} from 'typescript';
import {
  PLATFORM,
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $Any,
  $AnyNonEmpty,
} from '../types/_shared';
import {
  I$Node,
  Context,
  $identifier,
  $$AssignmentExpressionOrHigher,
  $assignmentExpression,
  $AssignmentExpressionNode,
  $$JsxOpeningLikeElement,
  $i,
  TransformationContext,
} from './_shared';
import {
  $$ESModuleOrScript,
} from './modules';
import {
  $Identifier,
  $PropertyAccessExpression,
  $ThisExpression,
} from './expressions';
import {
  $StringLiteral,
} from './literals';

const {
  emptyArray,
} = PLATFORM;

export type $$JsxParent = (
  $JsxElement |
  $JsxFragment
);

export type $$JsxChild = (
  $JsxText |
  $JsxExpression |
  $JsxElement |
  $JsxSelfClosingElement |
  $JsxFragment
);

export function $$jsxChildList(
  nodes: readonly JsxChild[],
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): readonly $$JsxChild[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$JsxChild[] = Array(len);
  for (let i = 0; i < len; ++i) {
    switch (nodes[i].kind) {
      case SyntaxKind.JsxText:
        $nodes[i] = new $JsxText(nodes[i] as JsxText, ctx, i, depth + 1, mos, realm, logger, path);
        break;
      case SyntaxKind.JsxExpression:
        $nodes[i] = new $JsxExpression(nodes[i] as JsxExpression, ctx, i, depth + 1, mos, realm, logger, path);
        break;
      case SyntaxKind.JsxElement:
        $nodes[i] = new $JsxElement(nodes[i] as JsxElement, ctx, i, depth + 1, mos, realm, logger, path);
        break;
      case SyntaxKind.JsxSelfClosingElement:
        $nodes[i] = new $JsxSelfClosingElement(nodes[i] as JsxSelfClosingElement, ctx, i, depth + 1, mos, realm, logger, path);
        break;
      case SyntaxKind.JsxFragment:
        $nodes[i] = new $JsxFragment(nodes[i] as JsxFragment, ctx, i, depth + 1, mos, realm, logger, path);
        break;
    }
  }
  return $nodes;
}

export class $JsxElement implements I$Node {
  public get $kind(): SyntaxKind.JsxElement { return SyntaxKind.JsxElement; }

  public readonly $openingElement: $JsxOpeningElement;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingElement: $JsxClosingElement;

  public parent!: $$JsxParent;
  public readonly path: string;

  public constructor(
    public readonly node: JsxElement,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxElement`;

    const $openingElement = this.$openingElement = new $JsxOpeningElement(node.openingElement, ctx, depth + 1, mos, realm, logger, path);
    $openingElement.parent = this;
    const $children = this.$children = $$jsxChildList(node.children, ctx, depth + 1, mos, realm, logger, path);
    $children.forEach(x => x.parent = this);
    const $closingElement = this.$closingElement = new $JsxClosingElement(node.closingElement, ctx, depth + 1, mos, realm, logger, path);
    $closingElement.parent = this;
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export type $$JsxNamed = (
  $JsxOpeningElement |
  $JsxClosingElement |
  $JsxSelfClosingElement
);

export type $$JsxTagNamePropertyAccess = $PropertyAccessExpression & {
  expression: $$JsxTagNameExpression;
};

export type $$JsxTagNameExpression = (
  $Identifier |
  $ThisExpression |
  $$JsxTagNamePropertyAccess
);

export function $$jsxTagNameExpression(
  node: JsxTagNameExpression,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$JsxTagNameExpression {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, ctx, idx, depth + 1, mos, realm, logger, path) as $$JsxTagNamePropertyAccess;
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

export class $JsxSelfClosingElement implements I$Node {
  public get $kind(): SyntaxKind.JsxSelfClosingElement { return SyntaxKind.JsxSelfClosingElement; }

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public parent!: $$JsxParent;
  public readonly path: string;

  public constructor(
    public readonly node: JsxSelfClosingElement,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxSelfClosingElement`;

    const $tagName = this.$tagName = $$jsxTagNameExpression(node.tagName, ctx, -1, depth + 1, mos, realm, logger, path);
    $tagName.parent = this;
    const $attributes = this.$attributes = new $JsxAttributes(node.attributes, ctx, depth + 1, mos, realm, logger, path);
    $attributes.parent = this;
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxFragment implements I$Node {
  public get $kind(): SyntaxKind.JsxFragment { return SyntaxKind.JsxFragment; }

  public readonly $openingFragment: $JsxOpeningFragment;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingFragment: $JsxClosingFragment;

  public parent!: $$JsxParent;
  public readonly path: string;

  public constructor(
    public readonly node: JsxFragment,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxFragment`;

    const $openingFragment = this.$openingFragment = new $JsxOpeningFragment(node.openingFragment, ctx, depth + 1, mos, realm, logger, path);
    $openingFragment.parent = this;
    const $children = this.$children = $$jsxChildList(node.children, ctx, depth + 1, mos, realm, logger, path);
    $children.forEach(x => x.parent = this);
    const $closingFragment = this.$closingFragment = new $JsxClosingFragment(node.closingFragment, ctx, depth + 1, mos, realm, logger, path);
    $closingFragment.parent = this;
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxText implements I$Node {
  public get $kind(): SyntaxKind.JsxText { return SyntaxKind.JsxText; }

  public parent!: $$JsxParent;
  public readonly path: string;

  public constructor(
    public readonly node: JsxText,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxText`;
}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxOpeningElement implements I$Node {
  public get $kind(): SyntaxKind.JsxOpeningElement { return SyntaxKind.JsxOpeningElement; }

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public parent!: $JsxElement;
  public readonly path: string;

  public constructor(
    public readonly node: JsxOpeningElement,
    public readonly ctx: Context,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}.JsxOpeningElement`;

    const $tagName = this.$tagName = $$jsxTagNameExpression(node.tagName, ctx, -1, depth + 1, mos, realm, logger, path);
    $tagName.parent = this;
    const $attributes = this.$attributes = new $JsxAttributes(node.attributes, ctx, depth + 1, mos, realm, logger, path);
    $attributes.parent = this;
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxClosingElement implements I$Node {
  public get $kind(): SyntaxKind.JsxClosingElement { return SyntaxKind.JsxClosingElement; }

  public readonly $tagName: $$JsxTagNameExpression;

  public parent!: $JsxElement;
  public readonly path: string;

  public constructor(
    public readonly node: JsxClosingElement,
    public readonly ctx: Context,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}.JsxClosingElement`;

    const $tagName = this.$tagName = $$jsxTagNameExpression(node.tagName, ctx, -1, depth + 1, mos, realm, logger, path);
    $tagName.parent = this;
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxOpeningFragment implements I$Node {
  public get $kind(): SyntaxKind.JsxOpeningFragment { return SyntaxKind.JsxOpeningFragment; }

  public parent!: $JsxFragment;
  public readonly path: string;

  public constructor(
    public readonly node: JsxOpeningFragment,
    public readonly ctx: Context,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}.JsxOpeningFragment`;
}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxClosingFragment implements I$Node {
  public get $kind(): SyntaxKind.JsxClosingFragment { return SyntaxKind.JsxClosingFragment; }

  public parent!: $JsxFragment;
  public readonly path: string;

  public constructor(
    public readonly node: JsxClosingFragment,
    public readonly ctx: Context,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}.JsxClosingFragment`;
}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxAttribute implements I$Node {
  public get $kind(): SyntaxKind.JsxAttribute { return SyntaxKind.JsxAttribute; }

  public readonly $name: $Identifier;
  public readonly $initializer: $StringLiteral | $JsxExpression | undefined;

  public parent!: $JsxAttributes;
  public readonly path: string;

  public constructor(
    public readonly node: JsxAttribute,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxAttribute`;

    const $name = this.$name = $identifier(node.name, ctx, -1, depth + 1, mos, realm, logger, path);
    $name.parent = this;
    if (node.initializer === void 0) {
      this.$initializer = void 0;
    } else {
      if (node.initializer.kind === SyntaxKind.StringLiteral) {
        const $initializer = this.$initializer = new $StringLiteral(node.initializer, ctx, -1, depth + 1, mos, realm, logger, path);
        $initializer.parent = this;
      } else {
        const $initializer = this.$initializer = new $JsxExpression(node.initializer, ctx, -1, depth + 1, mos, realm, logger, path);
        $initializer.parent = this;
      }
    }
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export type $$JsxAttributeLike = (
  $JsxAttribute |
  $JsxSpreadAttribute
);

export function $$jsxAttributeLikeList(
  nodes: readonly JsxAttributeLike[],
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): readonly $$JsxAttributeLike[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$JsxAttributeLike[] = Array(len);
  for (let i = 0; i < len; ++i) {
    switch (nodes[i].kind) {
      case SyntaxKind.JsxAttribute:
        $nodes[i] = new $JsxAttribute(nodes[i] as JsxAttribute, ctx, i, depth + 1, mos, realm, logger, path);
        break;
      case SyntaxKind.JsxSpreadAttribute:
        $nodes[i] = new $JsxSpreadAttribute(nodes[i] as JsxSpreadAttribute, ctx, i, depth + 1, mos, realm, logger, path);
        break;
    }
  }
  return $nodes;
}

export class $JsxAttributes implements I$Node {
  public get $kind(): SyntaxKind.JsxAttributes { return SyntaxKind.JsxAttributes; }

  public readonly $properties: readonly $$JsxAttributeLike[];

  public parent!: $$JsxOpeningLikeElement;
  public readonly path: string;

  public constructor(
    public readonly node: JsxAttributes,
    public readonly ctx: Context,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}.JsxAttributes`;

    const $properties = this.$properties = $$jsxAttributeLikeList(node.properties, ctx, depth + 1, mos, realm, logger, path);
    $properties.forEach(x => x.parent = this);
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxSpreadAttribute implements I$Node {
  public get $kind(): SyntaxKind.JsxSpreadAttribute { return SyntaxKind.JsxSpreadAttribute; }

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public parent!: $JsxAttributes;
  public readonly path: string;

  public constructor(
    public readonly node: JsxSpreadAttribute,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxSpreadAttribute`;

    const $expression = this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, ctx, -1, depth + 1, mos, realm, logger, path);
    $expression.parent = this;
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}

export class $JsxExpression implements I$Node {
  public get $kind(): SyntaxKind.JsxExpression { return SyntaxKind.JsxExpression; }

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  public parent!: $$JsxParent | $$JsxAttributeLike;
  public readonly path: string;

  public constructor(
    public readonly node: JsxExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly depth: number,
    public readonly mos: $$ESModuleOrScript,
    public readonly realm: Realm,
    public readonly logger: ILogger,
    path: string,
  ) {
    this.path = `${path}${$i(idx)}.JsxExpression`;

    const $expression = this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode | undefined, ctx, -1, depth + 1, mos, realm, logger, path);
    if ($expression !== void 0) { $expression.parent = this; }
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }

  public transform(tctx: TransformationContext): this['node'] {
    return this.node;
  }
}
