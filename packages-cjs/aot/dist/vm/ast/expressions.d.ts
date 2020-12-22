import { ArrayLiteralExpression, AsExpression, AwaitExpression, BinaryExpression, CallExpression, ConditionalExpression, Decorator, DeleteExpression, ElementAccessExpression, Identifier, MetaProperty, ModifierFlags, NewExpression, NonNullExpression, ObjectLiteralElementLike, ObjectLiteralExpression, ParenthesizedExpression, PostfixUnaryExpression, PrefixUnaryExpression, PropertyAccessExpression, PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment, SuperExpression, SyntaxKind, TaggedTemplateExpression, TemplateExpression, TemplateSpan, ThisExpression, TypeAssertion, TypeOfExpression, VoidExpression, YieldExpression } from 'typescript';
import { ILogger } from '@aurelia/kernel';
import { Realm, ExecutionContext } from '../realm.js';
import { $EnvRec } from '../types/environment-record.js';
import { $String } from '../types/string.js';
import { $Undefined } from '../types/undefined.js';
import { $Any, $AnyNonEmpty, $AnyObject } from '../types/_shared.js';
import { $Object } from '../types/object.js';
import { $Reference } from '../types/reference.js';
import { $Number } from '../types/number.js';
import { $Boolean } from '../types/boolean.js';
import { $Empty, empty } from '../types/empty.js';
import { $IteratorRecord } from '../globals/iteration.js';
import { $Error } from '../types/error.js';
import { $ArrayExoticObject } from '../exotics/array.js';
import { $List } from '../types/list.js';
import { I$Node, Context, $$PropertyName, $$AssignmentExpressionOrHigher, $$LHSExpressionOrHigher, $NodeWithDecorators, $AnyParentNode, $ArgumentOrArrayLiteralElementNode, $$UnaryExpressionOrHigher, $$BinaryExpressionOrHigher, $$UpdateExpressionOrHigher } from './_shared.js';
import { $$ESModuleOrScript } from './modules.js';
import { $SpreadElement, $OmittedExpression } from './bindings.js';
import { $MethodDeclaration, $GetAccessorDeclaration, $SetAccessorDeclaration } from './methods.js';
import { $NoSubstitutionTemplateLiteral, $TemplateSpan, $TemplateHead } from './literals.js';
export declare class $Decorator implements I$Node {
    readonly node: Decorator;
    readonly parent: $NodeWithDecorators;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.Decorator;
    readonly $expression: $$LHSExpressionOrHigher;
    constructor(node: Decorator, parent: $NodeWithDecorators, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ThisExpression implements I$Node {
    readonly node: ThisExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ThisKeyword;
    readonly CoveredParenthesizedExpression: $ThisExpression;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: ThisExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $SuperExpression implements I$Node {
    readonly node: SuperExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.SuperKeyword;
    constructor(node: SuperExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare type $NodeWithSpreadElements = ($ArrayLiteralExpression | $CallExpression | $NewExpression);
export declare type $$ArgumentOrArrayLiteralElement = ($$AssignmentExpressionOrHigher | $SpreadElement | $OmittedExpression);
export declare function $argumentOrArrayLiteralElement(node: $ArgumentOrArrayLiteralElementNode, parent: $NodeWithSpreadElements, ctx: Context, idx: number): $$ArgumentOrArrayLiteralElement;
export declare function $argumentOrArrayLiteralElementList(nodes: readonly $ArgumentOrArrayLiteralElementNode[] | undefined, parent: $NodeWithSpreadElements, ctx: Context): readonly $$ArgumentOrArrayLiteralElement[];
export declare class $ArrayLiteralExpression implements I$Node {
    readonly node: ArrayLiteralExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ArrayLiteralExpression;
    readonly $elements: readonly $$ArgumentOrArrayLiteralElement[];
    readonly CoveredParenthesizedExpression: $ArrayLiteralExpression;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: ArrayLiteralExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    AccumulateArray(ctx: ExecutionContext, array: $ArrayExoticObject, nextIndex: $Number): $Number | $Error;
    Evaluate(ctx: ExecutionContext): $ArrayExoticObject | $Error;
}
export declare type $$ObjectLiteralElementLike = ($PropertyAssignment | $ShorthandPropertyAssignment | $SpreadAssignment | $MethodDeclaration | $GetAccessorDeclaration | $SetAccessorDeclaration);
export declare function $$objectLiteralElementLikeList(nodes: readonly ObjectLiteralElementLike[], parent: $ObjectLiteralExpression, ctx: Context): readonly $$ObjectLiteralElementLike[];
export declare class $ObjectLiteralExpression implements I$Node {
    readonly node: ObjectLiteralExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ObjectLiteralExpression;
    readonly $properties: readonly $$ObjectLiteralElementLike[];
    readonly CoveredParenthesizedExpression: $ObjectLiteralExpression;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: ObjectLiteralExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Object | $Error;
}
export declare class $PropertyAssignment implements I$Node {
    readonly node: PropertyAssignment;
    readonly parent: $ObjectLiteralExpression;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.PropertyAssignment;
    readonly modifierFlags: ModifierFlags;
    readonly $name: $$PropertyName;
    readonly $initializer: $$AssignmentExpressionOrHigher;
    readonly PropName: $String | $Empty;
    constructor(node: PropertyAssignment, parent: $ObjectLiteralExpression, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluatePropertyDefinition(ctx: ExecutionContext, object: $Object, enumerable: $Boolean): $Boolean | $Error;
}
export declare class $ShorthandPropertyAssignment implements I$Node {
    readonly node: ShorthandPropertyAssignment;
    readonly parent: $ObjectLiteralExpression;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ShorthandPropertyAssignment;
    readonly modifierFlags: ModifierFlags;
    readonly $name: $Identifier;
    readonly $objectAssignmentInitializer: $$AssignmentExpressionOrHigher | undefined;
    readonly PropName: $String;
    constructor(node: ShorthandPropertyAssignment, parent: $ObjectLiteralExpression, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluatePropertyDefinition(ctx: ExecutionContext, object: $Object, enumerable: $Boolean): $Boolean | $Error;
}
export declare class $SpreadAssignment implements I$Node {
    readonly node: SpreadAssignment;
    readonly parent: $ObjectLiteralExpression;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.SpreadAssignment;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly PropName: empty;
    constructor(node: SpreadAssignment, parent: $ObjectLiteralExpression, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluatePropertyDefinition<T extends $AnyObject>(ctx: ExecutionContext, object: T, enumerable: $Boolean): T | $Error;
}
export declare class $PropertyAccessExpression implements I$Node {
    readonly node: PropertyAccessExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.PropertyAccessExpression;
    readonly $expression: $$LHSExpressionOrHigher;
    readonly $name: $Identifier;
    constructor(node: PropertyAccessExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Reference | $Error;
}
export declare class $ElementAccessExpression implements I$Node {
    readonly node: ElementAccessExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ElementAccessExpression;
    readonly $expression: $$LHSExpressionOrHigher;
    readonly $argumentExpression: $$AssignmentExpressionOrHigher;
    constructor(node: ElementAccessExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Reference | $Error;
}
export declare class $CallExpression implements I$Node {
    readonly node: CallExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.CallExpression;
    readonly $expression: $$LHSExpressionOrHigher;
    readonly $arguments: readonly $$ArgumentOrArrayLiteralElement[];
    constructor(node: CallExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare function $EvaluateCall(ctx: ExecutionContext, func: $AnyNonEmpty, ref: $Any, $arguments: readonly $$ArgumentOrArrayLiteralElement[], tailPosition: $Boolean): $AnyNonEmpty;
export declare function $ArgumentListEvaluation(ctx: ExecutionContext, args: readonly $$ArgumentOrArrayLiteralElement[]): $List<$AnyNonEmpty> | $Error;
export declare class $NewExpression implements I$Node {
    readonly node: NewExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NewExpression;
    readonly $expression: $$LHSExpressionOrHigher;
    readonly $arguments: readonly $$ArgumentOrArrayLiteralElement[];
    constructor(node: NewExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare type $$TemplateLiteral = ($NoSubstitutionTemplateLiteral | $TemplateExpression);
export declare class $TaggedTemplateExpression implements I$Node {
    readonly node: TaggedTemplateExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TaggedTemplateExpression;
    readonly $tag: $$LHSExpressionOrHigher;
    readonly $template: $$TemplateLiteral;
    constructor(node: TaggedTemplateExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare function $$templateSpanList(nodes: readonly TemplateSpan[], parent: $TemplateExpression, ctx: Context): readonly $TemplateSpan[];
export declare class $TemplateExpression implements I$Node {
    readonly node: TemplateExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TemplateExpression;
    readonly $head: $TemplateHead;
    readonly $templateSpans: readonly $TemplateSpan[];
    readonly CoveredParenthesizedExpression: $TemplateExpression;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: false;
    readonly AssignmentTargetType: 'invalid';
    constructor(node: TemplateExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $String;
}
export declare class $ParenthesizedExpression implements I$Node {
    readonly node: ParenthesizedExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ParenthesizedExpression;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly CoveredParenthesizedExpression: $$AssignmentExpressionOrHigher;
    constructor(node: ParenthesizedExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty | $Reference | $Error;
}
export declare class $NonNullExpression implements I$Node {
    readonly node: NonNullExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NonNullExpression;
    readonly $expression: $$LHSExpressionOrHigher;
    constructor(node: NonNullExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty | $Reference | $Error;
}
export declare class $MetaProperty implements I$Node {
    readonly node: MetaProperty;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.MetaProperty;
    readonly $name: $Identifier;
    constructor(node: MetaProperty, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $DeleteExpression implements I$Node {
    readonly node: DeleteExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.DeleteExpression;
    readonly $expression: $$UnaryExpressionOrHigher;
    constructor(node: DeleteExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Boolean;
}
export declare class $TypeOfExpression implements I$Node {
    readonly node: TypeOfExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TypeOfExpression;
    readonly $expression: $$UnaryExpressionOrHigher;
    constructor(node: TypeOfExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $String | $Undefined | $Error;
}
export declare class $VoidExpression implements I$Node {
    readonly node: VoidExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.VoidExpression;
    readonly $expression: $$UnaryExpressionOrHigher;
    constructor(node: VoidExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $AwaitExpression implements I$Node {
    readonly node: AwaitExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.AwaitExpression;
    readonly $expression: $$UnaryExpressionOrHigher;
    constructor(node: AwaitExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $PrefixUnaryExpression implements I$Node {
    readonly node: PrefixUnaryExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.PrefixUnaryExpression;
    readonly $operand: $$UnaryExpressionOrHigher;
    constructor(node: PrefixUnaryExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $PostfixUnaryExpression implements I$Node {
    readonly node: PostfixUnaryExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.PostfixUnaryExpression;
    readonly $operand: $$LHSExpressionOrHigher;
    constructor(node: PostfixUnaryExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $TypeAssertion implements I$Node {
    readonly node: TypeAssertion;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TypeAssertionExpression;
    readonly $expression: $$AssignmentExpressionOrHigher;
    constructor(node: TypeAssertion, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty | $Reference | $Error;
}
export declare class $BinaryExpression implements I$Node {
    readonly node: BinaryExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.BinaryExpression;
    readonly $left: $$BinaryExpressionOrHigher;
    readonly $right: $$BinaryExpressionOrHigher;
    constructor(node: BinaryExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $ConditionalExpression implements I$Node {
    readonly node: ConditionalExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ConditionalExpression;
    readonly $condition: $$BinaryExpressionOrHigher;
    readonly $whenTrue: $$AssignmentExpressionOrHigher;
    readonly $whenFalse: $$AssignmentExpressionOrHigher;
    constructor(node: ConditionalExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $YieldExpression implements I$Node {
    readonly node: YieldExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.YieldExpression;
    readonly $expression: $$AssignmentExpressionOrHigher;
    constructor(node: YieldExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $AsExpression implements I$Node {
    readonly node: AsExpression;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.AsExpression;
    readonly $expression: $$UpdateExpressionOrHigher;
    constructor(node: AsExpression, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty | $Reference | $Error;
}
export declare class $Identifier implements I$Node {
    readonly node: Identifier;
    readonly parent: $AnyParentNode;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.Identifier;
    readonly StringValue: $String;
    readonly PropName: $String;
    readonly BoundNames: readonly [$String];
    readonly AssignmentTargetType: 'strict' | 'simple';
    readonly CoveredParenthesizedExpression: $Identifier;
    readonly HasName: false;
    readonly IsFunctionDefinition: false;
    readonly IsIdentifierRef: true;
    readonly ContainsExpression: false;
    readonly HasInitializer: false;
    readonly IsSimpleParameterList: true;
    get isUndefined(): false;
    get isNull(): false;
    constructor(node: Identifier, parent: $AnyParentNode, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Reference | $Error;
    EvaluatePropName(ctx: ExecutionContext): $String;
    InitializePropertyBinding(ctx: ExecutionContext, value: $AnyNonEmpty, environment: $EnvRec | undefined): $List<$String> | $Error;
    InitializeIteratorBinding(ctx: ExecutionContext, iteratorRecord: $IteratorRecord, environment: $EnvRec | undefined, initializer?: $$AssignmentExpressionOrHigher): $Any;
    InitializeKeyedBinding(ctx: ExecutionContext, value: $AnyNonEmpty, environment: $EnvRec | undefined, propertyName: $String, initializer?: $$AssignmentExpressionOrHigher): $Any;
}
//# sourceMappingURL=expressions.d.ts.map