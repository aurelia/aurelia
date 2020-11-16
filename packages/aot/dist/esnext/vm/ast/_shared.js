import { ModifierFlags, SyntaxKind, } from 'typescript';
import { emptyArray, } from '@aurelia/kernel';
import { $Function, } from '../types/function.js';
import { $ArrayBindingPattern, $ComputedPropertyName, $ObjectBindingPattern, } from './bindings.js';
import { $ArrayLiteralExpression, $AsExpression, $AwaitExpression, $BinaryExpression, $CallExpression, $ConditionalExpression, $Decorator, $DeleteExpression, $ElementAccessExpression, $MetaProperty, $NewExpression, $NonNullExpression, $ObjectLiteralExpression, $ParenthesizedExpression, $PostfixUnaryExpression, $PrefixUnaryExpression, $PropertyAccessExpression, $TaggedTemplateExpression, $TemplateExpression, $TypeAssertion, $TypeOfExpression, $VoidExpression, $YieldExpression, $Identifier, $ThisExpression, $SuperExpression, } from './expressions.js';
import { $ArrowFunction, $ConstructorDeclaration, $FunctionExpression, $FunctionDeclaration, } from './functions.js';
import { $Block, $BreakStatement, $ContinueStatement, $DoStatement, $ExpressionStatement, $ForInStatement, $ForOfStatement, $ForStatement, $IfStatement, $LabeledStatement, $ReturnStatement, $SwitchStatement, $ThrowStatement, $TryStatement, $WhileStatement, $WithStatement, $VariableStatement, $EmptyStatement, $DebuggerStatement, } from './statements.js';
import { $ClassExpression, $HeritageClause, $PropertyDeclaration, $ClassDeclaration, $SemicolonClassElement, } from './classes.js';
import { $InterfaceDeclaration, $TypeAliasDeclaration, $EnumDeclaration, } from './types.js';
import { $GetAccessorDeclaration, $MethodDeclaration, $SetAccessorDeclaration, } from './methods.js';
import { $JsxElement, $JsxFragment, $JsxSelfClosingElement, } from './jsx.js';
import { $BigIntLiteral, $BooleanLiteral, $NoSubstitutionTemplateLiteral, $NullLiteral, $NumericLiteral, $RegularExpressionLiteral, $StringLiteral, } from './literals.js';
import { $StringSet, } from '../globals/string.js';
export function $assignmentExpression(node, parent, ctx, idx) {
    if (node === void 0) {
        return void 0;
    }
    switch (node.kind) {
        case SyntaxKind.AsExpression:
            return new $AsExpression(node, parent, ctx, idx);
        case SyntaxKind.BinaryExpression:
            return new $BinaryExpression(node, parent, ctx, idx);
        case SyntaxKind.ArrowFunction:
            return new $ArrowFunction(node, parent, ctx, idx);
        case SyntaxKind.ConditionalExpression:
            return new $ConditionalExpression(node, parent, ctx, idx);
        case SyntaxKind.YieldExpression:
            return new $YieldExpression(node, parent, ctx, idx);
        default:
            return $unaryExpression(node, parent, ctx, idx);
    }
}
export function $unaryExpression(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.JsxElement:
            return new $JsxElement(node, parent, ctx, idx);
        case SyntaxKind.JsxFragment:
            return new $JsxFragment(node, parent, ctx, idx);
        case SyntaxKind.JsxSelfClosingElement:
            return new $JsxSelfClosingElement(node, parent, ctx, idx);
        case SyntaxKind.PostfixUnaryExpression:
            return new $PostfixUnaryExpression(node, parent, ctx, idx);
        case SyntaxKind.PrefixUnaryExpression:
            return new $PrefixUnaryExpression(node, parent, ctx, idx);
        case SyntaxKind.AwaitExpression:
            return new $AwaitExpression(node, parent, ctx, idx);
        case SyntaxKind.DeleteExpression:
            return new $DeleteExpression(node, parent, ctx, idx);
        case SyntaxKind.TypeAssertionExpression:
            return new $TypeAssertion(node, parent, ctx, idx);
        case SyntaxKind.TypeOfExpression:
            return new $TypeOfExpression(node, parent, ctx, idx);
        case SyntaxKind.VoidExpression:
            return new $VoidExpression(node, parent, ctx, idx);
        default:
            return $LHSExpression(node, parent, ctx, idx);
    }
}
export function $LHSExpression(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.ArrayLiteralExpression:
            return new $ArrayLiteralExpression(node, parent, ctx, idx);
        case SyntaxKind.ClassExpression:
            return new $ClassExpression(node, parent, ctx, idx);
        case SyntaxKind.FunctionExpression:
            return new $FunctionExpression(node, parent, ctx, idx);
        case SyntaxKind.Identifier:
            return new $Identifier(node, parent, ctx, idx);
        case SyntaxKind.NewExpression:
            return new $NewExpression(node, parent, ctx, idx);
        case SyntaxKind.ObjectLiteralExpression:
            return new $ObjectLiteralExpression(node, parent, ctx, idx);
        case SyntaxKind.ParenthesizedExpression:
            return new $ParenthesizedExpression(node, parent, ctx, idx);
        case SyntaxKind.TemplateExpression:
            return new $TemplateExpression(node, parent, ctx, idx);
        case SyntaxKind.ElementAccessExpression:
            return new $ElementAccessExpression(node, parent, ctx, idx);
        case SyntaxKind.NonNullExpression:
            return new $NonNullExpression(node, parent, ctx, idx);
        case SyntaxKind.PropertyAccessExpression:
            return new $PropertyAccessExpression(node, parent, ctx, idx);
        case SyntaxKind.TaggedTemplateExpression:
            return new $TaggedTemplateExpression(node, parent, ctx, idx);
        case SyntaxKind.CallExpression:
            return new $CallExpression(node, parent, ctx, idx);
        case SyntaxKind.MetaProperty:
            return new $MetaProperty(node, parent, ctx, idx);
        case SyntaxKind.ThisKeyword:
            return new $ThisExpression(node, parent, ctx, idx);
        case SyntaxKind.SuperKeyword:
            return new $SuperExpression(node, parent, ctx, idx);
        case SyntaxKind.NumericLiteral:
            return new $NumericLiteral(node, parent, ctx, idx);
        case SyntaxKind.BigIntLiteral:
            return new $BigIntLiteral(node, parent, ctx, idx);
        case SyntaxKind.StringLiteral:
            return new $StringLiteral(node, parent, ctx, idx);
        case SyntaxKind.RegularExpressionLiteral:
            return new $RegularExpressionLiteral(node, parent, ctx, idx);
        case SyntaxKind.NoSubstitutionTemplateLiteral:
            return new $NoSubstitutionTemplateLiteral(node, parent, ctx, idx);
        case SyntaxKind.NullKeyword:
            return new $NullLiteral(node, parent, ctx, idx);
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
            return new $BooleanLiteral(node, parent, ctx, idx);
        default:
            throw new Error(`Unexpected syntax node: ${SyntaxKind[node.kind]}.`);
    }
}
export function $identifier(node, parent, ctx, idx) {
    if (node === void 0) {
        return void 0;
    }
    return new $Identifier(node, parent, ctx, idx);
}
export function $$propertyName(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.Identifier:
            return new $Identifier(node, parent, ctx, idx);
        case SyntaxKind.StringLiteral:
            return new $StringLiteral(node, parent, ctx, idx);
        case SyntaxKind.NumericLiteral:
            return new $NumericLiteral(node, parent, ctx, idx);
        case SyntaxKind.ComputedPropertyName:
            return new $ComputedPropertyName(node, parent, ctx, idx);
    }
}
export function $$bindingName(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.Identifier:
            return new $Identifier(node, parent, ctx | 8 /* IsBindingName */, idx);
        case SyntaxKind.ObjectBindingPattern:
            return new $ObjectBindingPattern(node, parent, ctx, idx);
        case SyntaxKind.ArrayBindingPattern:
            return new $ArrayBindingPattern(node, parent, ctx, idx);
    }
}
export function $$esStatement(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.Block:
            return new $Block(node, parent, ctx, idx);
        case SyntaxKind.EmptyStatement:
            return new $EmptyStatement(node, parent, ctx, idx);
        case SyntaxKind.ExpressionStatement:
            return new $ExpressionStatement(node, parent, ctx, idx);
        case SyntaxKind.IfStatement:
            return new $IfStatement(node, parent, ctx, idx);
        case SyntaxKind.DoStatement:
            return new $DoStatement(node, parent, ctx, idx);
        case SyntaxKind.WhileStatement:
            return new $WhileStatement(node, parent, ctx, idx);
        case SyntaxKind.ForStatement:
            return new $ForStatement(node, parent, ctx, idx);
        case SyntaxKind.ForInStatement:
            return new $ForInStatement(node, parent, ctx, idx);
        case SyntaxKind.ForOfStatement:
            return new $ForOfStatement(node, parent, ctx, idx);
        case SyntaxKind.ContinueStatement:
            return new $ContinueStatement(node, parent, ctx, idx);
        case SyntaxKind.BreakStatement:
            return new $BreakStatement(node, parent, ctx, idx);
        case SyntaxKind.ReturnStatement:
            return new $ReturnStatement(node, parent, ctx, idx);
        case SyntaxKind.WithStatement:
            return new $WithStatement(node, parent, ctx, idx);
        case SyntaxKind.SwitchStatement:
            return new $SwitchStatement(node, parent, ctx, idx);
        case SyntaxKind.LabeledStatement:
            return new $LabeledStatement(node, parent, ctx, idx);
        case SyntaxKind.ThrowStatement:
            return new $ThrowStatement(node, parent, ctx, idx);
        case SyntaxKind.TryStatement:
            return new $TryStatement(node, parent, ctx, idx);
        case SyntaxKind.DebuggerStatement:
            return new $DebuggerStatement(node, parent, ctx, idx);
        default:
            throw new Error(`Unexpected syntax node: ${SyntaxKind[node.kind]}.`);
    }
}
export function $$tsStatementListItem(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.VariableStatement:
            return new $VariableStatement(node, parent, ctx, idx);
        case SyntaxKind.FunctionDeclaration:
            return new $FunctionDeclaration(node, parent, ctx, idx);
        case SyntaxKind.ClassDeclaration:
            return new $ClassDeclaration(node, parent, ctx, idx);
        case SyntaxKind.InterfaceDeclaration:
            return new $InterfaceDeclaration(node, parent, ctx, idx);
        case SyntaxKind.TypeAliasDeclaration:
            return new $TypeAliasDeclaration(node, parent, ctx, idx);
        case SyntaxKind.EnumDeclaration:
            return new $EnumDeclaration(node, parent, ctx, idx);
        default:
            return $$esStatement(node, parent, ctx, idx);
    }
}
export function $$tsStatementList(nodes, parent, ctx) {
    const len = nodes.length;
    let node;
    const $nodes = [];
    let x = 0;
    for (let i = 0; i < len; ++i) {
        node = nodes[i];
        if (node.kind === SyntaxKind.FunctionDeclaration && node.body === void 0) {
            continue;
        }
        $nodes[x] = $$tsStatementListItem(node, parent, ctx, x);
        ++x;
    }
    return $nodes;
}
export function $$esLabelledItem(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.VariableStatement:
            return new $VariableStatement(node, parent, ctx, idx);
        case SyntaxKind.FunctionDeclaration:
            return new $FunctionDeclaration(node, parent, ctx, idx);
        default:
            return $$esStatement(node, parent, ctx, idx);
    }
}
// #endregion
// #region AST helpers
export function GetDirectivePrologue(statements) {
    let directivePrologue = emptyArray;
    let statement;
    const len = statements.length;
    for (let i = 0; i < len; ++i) {
        statement = statements[i];
        if (statement.kind === SyntaxKind.ExpressionStatement
            && statement.expression.kind === SyntaxKind.StringLiteral) {
            if (directivePrologue === emptyArray) {
                directivePrologue = [statement];
            }
            else {
                directivePrologue.push(statement);
            }
            if (statement.expression.text === 'use strict') {
                directivePrologue.ContainsUseStrict = true;
            }
        }
        else {
            break;
        }
    }
    return directivePrologue;
}
export function GetExpectedArgumentCount(params) {
    for (let i = 0, ii = params.length; i < ii; ++i) {
        if (params[i].HasInitializer) {
            return i;
        }
    }
    return params.length;
}
export function evaluateStatement(ctx, statement) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    let stmtCompletion = intrinsics.empty;
    switch (statement.$kind) {
        case SyntaxKind.Block:
        case SyntaxKind.VariableStatement:
        case SyntaxKind.EmptyStatement:
        case SyntaxKind.ExpressionStatement:
        case SyntaxKind.IfStatement:
        case SyntaxKind.SwitchStatement:
        case SyntaxKind.ContinueStatement:
        case SyntaxKind.BreakStatement:
        case SyntaxKind.ReturnStatement:
        case SyntaxKind.WithStatement:
        case SyntaxKind.LabeledStatement:
        case SyntaxKind.ThrowStatement:
        case SyntaxKind.TryStatement:
        case SyntaxKind.DebuggerStatement:
        case SyntaxKind.FunctionDeclaration:
            stmtCompletion = statement.Evaluate(ctx);
            break;
        case SyntaxKind.DoStatement:
        case SyntaxKind.WhileStatement:
        case SyntaxKind.ForStatement:
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
            stmtCompletion = statement.EvaluateLabelled(ctx, new $StringSet());
            break;
        // Note that no default case is needed here as the cases above are exhausetive $$ESStatement (http://www.ecma-international.org/ecma-262/#prod-Statement)
    }
    return stmtCompletion;
}
// http://www.ecma-international.org/ecma-262/#sec-block-runtime-semantics-evaluation
// StatementList : StatementList StatementListItem
export function evaluateStatementList(ctx, statements) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let sl be the result of evaluating StatementList.
    // 2. ReturnIfAbrupt(sl).
    // 3. Let s be the result of evaluating StatementListItem.
    // 4. Return Completion(UpdateEmpty(s, sl)).
    let sl = intrinsics.empty;
    for (const statement of statements) {
        const s = evaluateStatement(ctx, statement); // TODO handle the declarations.
        if (s.isAbrupt) {
            return s;
        }
        sl = sl.UpdateEmpty(s);
    }
    return sl;
}
// http://www.ecma-international.org/ecma-262/#sec-blockdeclarationinstantiation
export function BlockDeclarationInstantiation(ctx, lexicallyScopedDeclarations, envRec) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let envRec be env's EnvironmentRecord.
    // 2. Assert: envRec is a declarative Environment Record.
    // 3. Let declarations be the LexicallyScopedDeclarations of code.
    // 4. For each element d in declarations, do
    for (const d of lexicallyScopedDeclarations) {
        // 4. a. For each element dn of the BoundNames of d, do
        for (const dn of d.BoundNames) {
            // 4. a. i. If IsConstantDeclaration of d is true, then
            if (d.IsConstantDeclaration) {
                // 4. a. i. 1. Perform ! envRec.CreateImmutableBinding(dn, true).
                envRec.CreateImmutableBinding(ctx, dn, intrinsics.true);
            }
            else {
                // 4. a. ii. Else,
                // 4. a. ii. 1. Perform ! envRec.CreateMutableBinding(dn, false).
                envRec.CreateImmutableBinding(ctx, dn, intrinsics.false);
            }
        }
        const dkind = d.$kind;
        // 4. b. If d is a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration, then
        if (dkind === SyntaxKind.FunctionDeclaration /* || dkind === SyntaxKind.GeneratorDeclaration || dkind === SyntaxKind.AsyncFunctionDeclaration || dkind === SyntaxKind.AsyncGeneratorDeclaration */) {
            // 4. b. i. Let fn be the sole element of the BoundNames of d.
            const fn = d.BoundNames[0];
            // 4. b. ii. Let fo be the result of performing InstantiateFunctionObject for d with argument env.
            const fo = d.InstantiateFunctionObject(ctx, envRec);
            if (fo.isAbrupt) {
                return fo;
            }
            // 4. b. iii. Perform envRec.InitializeBinding(fn, fo).
            envRec.InitializeBinding(ctx, fn, fo);
        }
    }
    return ctx.Realm['[[Intrinsics]]'].empty;
}
// http://www.ecma-international.org/ecma-262/#sec-isconstructor
export function IsConstructor(ctx, argument) {
    const intrinsics = ctx.Realm['[[Intrinsics]]'];
    // 1. If Type(argument) is not Object, return false.
    if (!argument.isObject) {
        return intrinsics.false.GetValue(ctx)['[[Value]]'];
    }
    // 2. If argument has a [[Construct]] internal method, return true.
    if (argument instanceof $Function && argument['[[Construct]]'] !== void 0) {
        return intrinsics.true.GetValue(ctx)['[[Value]]'];
    }
    // 3. Return false.
    return intrinsics.false.GetValue(ctx)['[[Value]]'];
}
export function $decoratorList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return emptyArray;
    }
    if (nodes.length === 1) {
        return [new $Decorator(nodes[0], parent, ctx, 0)];
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $Decorator(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
// Simple property accessors used for some map/flatMap/some/every operations,
// to avoid allocating a new arrow function for each of those calls.
export function getContainsExpression(obj) { return obj.ContainsExpression; }
export function getHasInitializer(obj) { return obj.HasInitializer; }
export function getIsSimpleParameterList(obj) { return obj.IsSimpleParameterList; }
export function getBoundNames(obj) { return obj.BoundNames; }
export function getLexicallyDeclaredNames(obj) { return obj.LexicallyDeclaredNames; }
export function getLexicallyScopedDeclarations(obj) { return obj.LexicallyScopedDeclarations; }
export function getVarDeclaredNames(obj) { return obj.VarDeclaredNames; }
export function getVarScopedDeclarations(obj) { return obj.VarScopedDeclarations; }
export function getLocalName(obj) { return obj.LocalName; }
export function getImportEntriesForModule(obj) { return obj.ImportEntriesForModule; }
export function getExportedNames(obj) { return obj.ExportedNames; }
export function getExportEntriesForModule(obj) { return obj.ExportEntriesForModule; }
export function getReferencedBindings(obj) { return obj.ReferencedBindings; }
export function $heritageClauseList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new $HeritageClause(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
export function $$classElementList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return emptyArray;
    }
    const len = nodes.length;
    const $nodes = [];
    let $node;
    let node;
    for (let i = 0; i < len; ++i) {
        node = nodes[i];
        if (node.body !== void 0) {
            $node = $$classElement(nodes[i], parent, ctx, i);
            if ($node !== void 0) {
                $nodes.push($node);
            }
        }
    }
    return $nodes;
}
export function $$classElement(node, parent, ctx, idx) {
    switch (node.kind) {
        case SyntaxKind.PropertyDeclaration:
            return new $PropertyDeclaration(node, parent, ctx, idx);
        case SyntaxKind.SemicolonClassElement:
            return new $SemicolonClassElement(node, parent, ctx, idx);
        case SyntaxKind.MethodDeclaration:
            return new $MethodDeclaration(node, parent, ctx, idx);
        case SyntaxKind.Constructor:
            return new $ConstructorDeclaration(node, parent, ctx, idx);
        case SyntaxKind.GetAccessor:
            return new $GetAccessorDeclaration(node, parent, ctx, idx);
        case SyntaxKind.SetAccessor:
            return new $SetAccessorDeclaration(node, parent, ctx, idx);
        default:
            return void 0;
    }
}
// #endregion
export function hasBit(flag, bit) {
    return (flag & bit) > 0;
}
export function hasAllBits(flag, bit) {
    return (flag & bit) === bit;
}
export function clearBit(flag, bit) {
    return (flag | bit) ^ bit;
}
export var Context;
(function (Context) {
    Context[Context["None"] = 0] = "None";
    Context[Context["Dynamic"] = 2] = "Dynamic";
    Context[Context["InVariableStatement"] = 4] = "InVariableStatement";
    Context[Context["IsBindingName"] = 8] = "IsBindingName";
    Context[Context["InParameterDeclaration"] = 16] = "InParameterDeclaration";
    Context[Context["InCatchClause"] = 32] = "InCatchClause";
    Context[Context["InBindingPattern"] = 64] = "InBindingPattern";
    Context[Context["InTypeElement"] = 128] = "InTypeElement";
    Context[Context["IsPropertyAccessName"] = 256] = "IsPropertyAccessName";
    Context[Context["IsMemberName"] = 512] = "IsMemberName";
    Context[Context["IsLabel"] = 1024] = "IsLabel";
    Context[Context["IsLabelReference"] = 2048] = "IsLabelReference";
    Context[Context["InExport"] = 4096] = "InExport";
    Context[Context["IsConst"] = 8192] = "IsConst";
    Context[Context["IsLet"] = 16384] = "IsLet";
    Context[Context["IsBlockScoped"] = 24576] = "IsBlockScoped";
    Context[Context["IsVar"] = 32768] = "IsVar";
    Context[Context["IsFunctionScoped"] = 32768] = "IsFunctionScoped";
    Context[Context["InStrictMode"] = 65536] = "InStrictMode";
})(Context || (Context = {}));
export const modifiersToModifierFlags = (function () {
    const lookup = Object.assign(Object.create(null), {
        [SyntaxKind.ConstKeyword]: ModifierFlags.Const,
        [SyntaxKind.DefaultKeyword]: ModifierFlags.Default,
        [SyntaxKind.ExportKeyword]: ModifierFlags.Export,
        [SyntaxKind.AsyncKeyword]: ModifierFlags.Async,
        [SyntaxKind.PrivateKeyword]: ModifierFlags.Private,
        [SyntaxKind.ProtectedKeyword]: ModifierFlags.Protected,
        [SyntaxKind.PublicKeyword]: ModifierFlags.Public,
        [SyntaxKind.StaticKeyword]: ModifierFlags.Static,
        [SyntaxKind.AbstractKeyword]: ModifierFlags.Abstract,
        [SyntaxKind.DeclareKeyword]: ModifierFlags.Ambient,
        [SyntaxKind.ReadonlyKeyword]: ModifierFlags.Readonly,
    });
    return function (mods) {
        if (mods === void 0) {
            return ModifierFlags.None;
        }
        const len = mods.length;
        if (len === 1) {
            return lookup[mods[0].kind];
        }
        else if (len === 2) {
            return lookup[mods[0].kind] + lookup[mods[1].kind];
        }
        else if (len === 3) {
            return lookup[mods[0].kind] + lookup[mods[1].kind] + lookup[mods[2].kind];
        }
        else {
            // More than 4 modifiers is not possible
            return lookup[mods[0].kind] + lookup[mods[1].kind] + lookup[mods[2].kind] + lookup[mods[3].kind];
        }
    };
})();
export var FunctionKind;
(function (FunctionKind) {
    FunctionKind[FunctionKind["normal"] = 0] = "normal";
    FunctionKind[FunctionKind["nonConstructor"] = 1] = "nonConstructor";
    FunctionKind[FunctionKind["classConstructor"] = 2] = "classConstructor";
    FunctionKind[FunctionKind["generator"] = 4] = "generator";
    FunctionKind[FunctionKind["async"] = 8] = "async";
    FunctionKind[FunctionKind["asyncGenerator"] = 12] = "asyncGenerator";
})(FunctionKind || (FunctionKind = {}));
/**
 * Returns the indexed string representation, or an empty string if the number is -1.
 */
export function $i(idx) {
    return idx === -1 ? '' : `[${idx}]`;
}
//# sourceMappingURL=_shared.js.map