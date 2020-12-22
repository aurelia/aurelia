import { BigIntLiteral, BooleanLiteral, NoSubstitutionTemplateLiteral, NullLiteral, NumericLiteral, RegularExpressionLiteral, StringLiteral, SyntaxKind, TemplateHead, TemplateMiddle, TemplateSpan, TemplateTail } from 'typescript';
import { ILogger } from '@aurelia/kernel';
import { Realm, ExecutionContext } from '../realm.js';
import { $String } from '../types/string.js';
import { $AnyNonEmpty } from '../types/_shared.js';
import { $Object } from '../types/object.js';
import { $Number } from '../types/number.js';
import { $Null } from '../types/null.js';
import { $Boolean } from '../types/boolean.js';
import { I$Node, Context, $$AssignmentExpressionOrHigher, $AnyParentNode } from './_shared.js';
import { $$ESModuleOrScript } from './modules.js';
import { $TemplateExpression } from './expressions.js';
export declare class $TemplateHead implements I$Node {
    readonly node: TemplateHead;
    readonly parent: $TemplateExpression;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TemplateHead;
    constructor(node: TemplateHead, parent: $TemplateExpression, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $TemplateMiddle implements I$Node {
    readonly node: TemplateMiddle;
    readonly parent: $TemplateExpression | $TemplateSpan;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TemplateMiddle;
    constructor(node: TemplateMiddle, parent: $TemplateExpression | $TemplateSpan, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $TemplateTail implements I$Node {
    readonly node: TemplateTail;
    readonly parent: $TemplateExpression | $TemplateSpan;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TemplateTail;
    constructor(node: TemplateTail, parent: $TemplateExpression | $TemplateSpan, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $TemplateSpan implements I$Node {
    readonly node: TemplateSpan;
    readonly parent: $TemplateExpression;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TemplateSpan;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $literal: $TemplateMiddle | $TemplateTail;
    constructor(node: TemplateSpan, parent: $TemplateExpression, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $NumericLiteral implements I$Node {
    readonly node: NumericLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NumericLiteral;
    readonly Value: $Number;
    readonly PropName: $String;
    readonly CoveredParenthesizedExpression: $NumericLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: NumericLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Number;
    EvaluatePropName(ctx: ExecutionContext): $String;
}
export declare class $BigIntLiteral implements I$Node {
    readonly node: BigIntLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.BigIntLiteral;
    readonly CoveredParenthesizedExpression: $BigIntLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: BigIntLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Number;
}
export declare class $StringLiteral implements I$Node {
    readonly node: StringLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.StringLiteral;
    readonly Value: $String;
    readonly StringValue: $String;
    readonly PropName: $String;
    readonly CoveredParenthesizedExpression: $StringLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: StringLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $String;
    EvaluatePropName(ctx: ExecutionContext): $String;
}
export declare class $RegularExpressionLiteral implements I$Node {
    readonly node: RegularExpressionLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.RegularExpressionLiteral;
    readonly StringValue: string;
    readonly CoveredParenthesizedExpression: $RegularExpressionLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: RegularExpressionLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Object;
}
export declare class $NoSubstitutionTemplateLiteral implements I$Node {
    readonly node: NoSubstitutionTemplateLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NoSubstitutionTemplateLiteral;
    readonly CoveredParenthesizedExpression: $NoSubstitutionTemplateLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: NoSubstitutionTemplateLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $String;
}
export declare class $NullLiteral implements I$Node {
    readonly node: NullLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NullKeyword;
    readonly Value: $Null;
    readonly CoveredParenthesizedExpression: $NullLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: NullLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Null;
}
export declare class $BooleanLiteral implements I$Node {
    readonly node: BooleanLiteral;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    readonly $kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
    readonly Value: $Boolean;
    readonly CoveredParenthesizedExpression: $BooleanLiteral;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: BooleanLiteral, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Boolean;
}
//# sourceMappingURL=literals.d.ts.map