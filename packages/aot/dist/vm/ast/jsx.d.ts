import { JsxAttribute, JsxAttributes, JsxChild, JsxClosingElement, JsxClosingFragment, JsxElement, JsxExpression, JsxFragment, JsxOpeningElement, JsxOpeningFragment, JsxSelfClosingElement, JsxSpreadAttribute, JsxTagNameExpression, JsxText, SyntaxKind, JsxAttributeLike } from 'typescript';
import { ILogger } from '@aurelia/kernel';
import { Realm, ExecutionContext } from '../realm.js';
import { $Any, $AnyNonEmpty } from '../types/_shared.js';
import { I$Node, Context, $$AssignmentExpressionOrHigher, $$JsxOpeningLikeElement } from './_shared.js';
import { $$ESModuleOrScript } from './modules.js';
import { $Identifier, $PropertyAccessExpression, $ThisExpression } from './expressions.js';
import { $StringLiteral } from './literals.js';
export declare type $$JsxParent = ($JsxElement | $JsxFragment);
export declare type $$JsxChild = ($JsxText | $JsxExpression | $JsxElement | $JsxSelfClosingElement | $JsxFragment);
export declare function $$jsxChildList(nodes: readonly JsxChild[], parent: $$JsxParent, ctx: Context): readonly $$JsxChild[];
export declare class $JsxElement implements I$Node {
    readonly node: JsxElement;
    readonly parent: $$JsxParent;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxElement;
    readonly $openingElement: $JsxOpeningElement;
    readonly $children: readonly $$JsxChild[];
    readonly $closingElement: $JsxClosingElement;
    constructor(node: JsxElement, parent: $$JsxParent, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare type $$JsxNamed = ($JsxOpeningElement | $JsxClosingElement | $JsxSelfClosingElement);
export declare type $$JsxTagNamePropertyAccess = $PropertyAccessExpression & {
    expression: $$JsxTagNameExpression;
};
export declare type $$JsxTagNameExpression = ($Identifier | $ThisExpression | $$JsxTagNamePropertyAccess);
export declare function $$jsxTagNameExpression(node: JsxTagNameExpression, parent: $$JsxNamed, ctx: Context, idx: number): $$JsxTagNameExpression;
export declare class $JsxSelfClosingElement implements I$Node {
    readonly node: JsxSelfClosingElement;
    readonly parent: $$JsxParent;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxSelfClosingElement;
    readonly $tagName: $$JsxTagNameExpression;
    readonly $attributes: $JsxAttributes;
    constructor(node: JsxSelfClosingElement, parent: $$JsxParent, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $JsxFragment implements I$Node {
    readonly node: JsxFragment;
    readonly parent: $$JsxParent;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxFragment;
    readonly $openingFragment: $JsxOpeningFragment;
    readonly $children: readonly $$JsxChild[];
    readonly $closingFragment: $JsxClosingFragment;
    constructor(node: JsxFragment, parent: $$JsxParent, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $JsxText implements I$Node {
    readonly node: JsxText;
    readonly parent: $$JsxParent;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxText;
    constructor(node: JsxText, parent: $$JsxParent, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxOpeningElement implements I$Node {
    readonly node: JsxOpeningElement;
    readonly parent: $JsxElement;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxOpeningElement;
    readonly $tagName: $$JsxTagNameExpression;
    readonly $attributes: $JsxAttributes;
    constructor(node: JsxOpeningElement, parent: $JsxElement, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxClosingElement implements I$Node {
    readonly node: JsxClosingElement;
    readonly parent: $JsxElement;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxClosingElement;
    readonly $tagName: $$JsxTagNameExpression;
    constructor(node: JsxClosingElement, parent: $JsxElement, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxOpeningFragment implements I$Node {
    readonly node: JsxOpeningFragment;
    readonly parent: $JsxFragment;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxOpeningFragment;
    constructor(node: JsxOpeningFragment, parent: $JsxFragment, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxClosingFragment implements I$Node {
    readonly node: JsxClosingFragment;
    readonly parent: $JsxFragment;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxClosingFragment;
    constructor(node: JsxClosingFragment, parent: $JsxFragment, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxAttribute implements I$Node {
    readonly node: JsxAttribute;
    readonly parent: $JsxAttributes;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxAttribute;
    readonly $name: $Identifier;
    readonly $initializer: $StringLiteral | $JsxExpression | undefined;
    constructor(node: JsxAttribute, parent: $JsxAttributes, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare type $$JsxAttributeLike = ($JsxAttribute | $JsxSpreadAttribute);
export declare function $$jsxAttributeLikeList(nodes: readonly JsxAttributeLike[], parent: $JsxAttributes, ctx: Context): readonly $$JsxAttributeLike[];
export declare class $JsxAttributes implements I$Node {
    readonly node: JsxAttributes;
    readonly parent: $$JsxOpeningLikeElement;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxAttributes;
    readonly $properties: readonly $$JsxAttributeLike[];
    constructor(node: JsxAttributes, parent: $$JsxOpeningLikeElement, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxSpreadAttribute implements I$Node {
    readonly node: JsxSpreadAttribute;
    readonly parent: $JsxAttributes;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxSpreadAttribute;
    readonly $expression: $$AssignmentExpressionOrHigher;
    constructor(node: JsxSpreadAttribute, parent: $JsxAttributes, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $JsxExpression implements I$Node {
    readonly node: JsxExpression;
    readonly parent: $$JsxParent | $$JsxAttributeLike;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.JsxExpression;
    readonly $expression: $$AssignmentExpressionOrHigher | undefined;
    constructor(node: JsxExpression, parent: $$JsxParent | $$JsxAttributeLike, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
//# sourceMappingURL=jsx.d.ts.map