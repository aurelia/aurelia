import ts from 'typescript';
import type {
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
  JsxAttributeLike,
} from 'typescript';
import {
  emptyArray,
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  $Any,
  $AnyNonEmpty,
} from '../types/_shared.js';
import {
  I$Node,
  Context,
  $identifier,
  $$AssignmentExpressionOrHigher,
  $assignmentExpression,
  $AssignmentExpressionNode,
  $$JsxOpeningLikeElement,
  $i,
} from './_shared.js';
import {
  $$ESModuleOrScript,
} from './modules.js';
import {
  $Identifier,
  $PropertyAccessExpression,
  $ThisExpression,
} from './expressions.js';
import {
  $StringLiteral,
} from './literals.js';

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
  parent: $$JsxParent,
  ctx: Context,
): readonly $$JsxChild[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$JsxChild[] = Array(len);
  for (let i = 0; i < len; ++i) {
    switch (nodes[i].kind) {
      case ts.SyntaxKind.JsxText:
        $nodes[i] = new $JsxText(nodes[i] as JsxText, parent, ctx, i);
        break;
      case ts.SyntaxKind.JsxExpression:
        $nodes[i] = new $JsxExpression(nodes[i] as JsxExpression, parent, ctx, i);
        break;
      case ts.SyntaxKind.JsxElement:
        $nodes[i] = new $JsxElement(nodes[i] as JsxElement, parent, ctx, i);
        break;
      case ts.SyntaxKind.JsxSelfClosingElement:
        $nodes[i] = new $JsxSelfClosingElement(nodes[i] as JsxSelfClosingElement, parent, ctx, i);
        break;
      case ts.SyntaxKind.JsxFragment:
        $nodes[i] = new $JsxFragment(nodes[i] as JsxFragment, parent, ctx, i);
        break;
    }
  }
  return $nodes;
}

export class $JsxElement implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxElement { return ts.SyntaxKind.JsxElement; }

  public readonly $openingElement: $JsxOpeningElement;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingElement: $JsxClosingElement;

  public constructor(
    public readonly node: JsxElement,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxElement`,
  ) {
    this.$openingElement = new $JsxOpeningElement(node.openingElement, this, ctx);
    this.$children = $$jsxChildList(node.children, this, ctx);
    this.$closingElement = new $JsxClosingElement(node.closingElement, this, ctx);
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
  parent: $$JsxNamed,
  ctx: Context,
  idx: number,
): $$JsxTagNameExpression {
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx, idx);
    case ts.SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, parent, ctx, idx);
    case ts.SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, parent, ctx, idx) as $$JsxTagNamePropertyAccess;
    default:
      throw new Error(`Unexpected syntax node: ${ts.SyntaxKind[(node as Node).kind]}.`);
  }
}

export class $JsxSelfClosingElement implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxSelfClosingElement { return ts.SyntaxKind.JsxSelfClosingElement; }

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public constructor(
    public readonly node: JsxSelfClosingElement,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxSelfClosingElement`,
  ) {
    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx, -1);
    this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
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
}

export class $JsxFragment implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxFragment { return ts.SyntaxKind.JsxFragment; }

  public readonly $openingFragment: $JsxOpeningFragment;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingFragment: $JsxClosingFragment;

  public constructor(
    public readonly node: JsxFragment,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxFragment`,
  ) {
    this.$openingFragment = new $JsxOpeningFragment(node.openingFragment, this, ctx);
    this.$children = $$jsxChildList(node.children, this, ctx);
    this.$closingFragment = new $JsxClosingFragment(node.closingFragment, this, ctx);
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
}

export class $JsxText implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxText { return ts.SyntaxKind.JsxText; }

  public constructor(
    public readonly node: JsxText,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxText`,
  ) {}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }
}

export class $JsxOpeningElement implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxOpeningElement { return ts.SyntaxKind.JsxOpeningElement; }

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public constructor(
    public readonly node: JsxOpeningElement,
    public readonly parent: $JsxElement,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.JsxOpeningElement`,
  ) {
    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx, -1);
    this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
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
}

export class $JsxClosingElement implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxClosingElement { return ts.SyntaxKind.JsxClosingElement; }

  public readonly $tagName: $$JsxTagNameExpression;

  public constructor(
    public readonly node: JsxClosingElement,
    public readonly parent: $JsxElement,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.JsxClosingElement`,
  ) {
    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx, -1);
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
}

export class $JsxOpeningFragment implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxOpeningFragment { return ts.SyntaxKind.JsxOpeningFragment; }

  public constructor(
    public readonly node: JsxOpeningFragment,
    public readonly parent: $JsxFragment,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.JsxOpeningFragment`,
  ) {}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }
}

export class $JsxClosingFragment implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxClosingFragment { return ts.SyntaxKind.JsxClosingFragment; }

  public constructor(
    public readonly node: JsxClosingFragment,
    public readonly parent: $JsxFragment,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.JsxClosingFragment`,
  ) {}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Any {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.empty; // TODO: implement this
  }
}

export class $JsxAttribute implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxAttribute { return ts.SyntaxKind.JsxAttribute; }

  public readonly $name: $Identifier;
  public readonly $initializer: $StringLiteral | $JsxExpression | undefined;

  public constructor(
    public readonly node: JsxAttribute,
    public readonly parent: $JsxAttributes,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxAttribute`,
  ) {
    this.$name = $identifier(node.name, this, ctx, -1);
    if (node.initializer === void 0) {
      this.$initializer = void 0;
    } else {
      if (node.initializer.kind === ts.SyntaxKind.StringLiteral) {
        this.$initializer = new $StringLiteral(node.initializer, this, ctx, -1);
      } else {
        this.$initializer = new $JsxExpression(node.initializer, this, ctx, -1);
      }
    }
  }
}

export type $$JsxAttributeLike = (
  $JsxAttribute |
  $JsxSpreadAttribute
);

export function $$jsxAttributeLikeList(
  nodes: readonly JsxAttributeLike[],
  parent: $JsxAttributes,
  ctx: Context,
): readonly $$JsxAttributeLike[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$JsxAttributeLike[] = Array(len);
  for (let i = 0; i < len; ++i) {
    switch (nodes[i].kind) {
      case ts.SyntaxKind.JsxAttribute:
        $nodes[i] = new $JsxAttribute(nodes[i] as JsxAttribute, parent, ctx, i);
        break;
      case ts.SyntaxKind.JsxSpreadAttribute:
        $nodes[i] = new $JsxSpreadAttribute(nodes[i] as JsxSpreadAttribute, parent, ctx, i);
        break;
    }
  }
  return $nodes;
}

export class $JsxAttributes implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxAttributes { return ts.SyntaxKind.JsxAttributes; }

  public readonly $properties: readonly $$JsxAttributeLike[];

  public constructor(
    public readonly node: JsxAttributes,
    public readonly parent: $$JsxOpeningLikeElement,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.JsxAttributes`,
  ) {
    this.$properties = $$jsxAttributeLikeList(node.properties, this, ctx);
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
}

export class $JsxSpreadAttribute implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxSpreadAttribute { return ts.SyntaxKind.JsxSpreadAttribute; }

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: JsxSpreadAttribute,
    public readonly parent: $JsxAttributes,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxSpreadAttribute`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
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
}

export class $JsxExpression implements I$Node {
  public get $kind(): ts.SyntaxKind.JsxExpression { return ts.SyntaxKind.JsxExpression; }

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: JsxExpression,
    public readonly parent: $$JsxParent | $$JsxAttributeLike,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.JsxExpression`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
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
}
