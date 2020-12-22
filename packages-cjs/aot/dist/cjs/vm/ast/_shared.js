"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$i = exports.FunctionKind = exports.modifiersToModifierFlags = exports.Context = exports.clearBit = exports.hasAllBits = exports.hasBit = exports.$$classElement = exports.$$classElementList = exports.$heritageClauseList = exports.getReferencedBindings = exports.getExportEntriesForModule = exports.getExportedNames = exports.getImportEntriesForModule = exports.getLocalName = exports.getVarScopedDeclarations = exports.getVarDeclaredNames = exports.getLexicallyScopedDeclarations = exports.getLexicallyDeclaredNames = exports.getBoundNames = exports.getIsSimpleParameterList = exports.getHasInitializer = exports.getContainsExpression = exports.$decoratorList = exports.IsConstructor = exports.BlockDeclarationInstantiation = exports.evaluateStatementList = exports.evaluateStatement = exports.GetExpectedArgumentCount = exports.GetDirectivePrologue = exports.$$esLabelledItem = exports.$$tsStatementList = exports.$$tsStatementListItem = exports.$$esStatement = exports.$$bindingName = exports.$$propertyName = exports.$identifier = exports.$LHSExpression = exports.$unaryExpression = exports.$assignmentExpression = void 0;
const typescript_1 = require("typescript");
const kernel_1 = require("@aurelia/kernel");
const function_js_1 = require("../types/function.js");
const bindings_js_1 = require("./bindings.js");
const expressions_js_1 = require("./expressions.js");
const functions_js_1 = require("./functions.js");
const statements_js_1 = require("./statements.js");
const classes_js_1 = require("./classes.js");
const types_js_1 = require("./types.js");
const methods_js_1 = require("./methods.js");
const jsx_js_1 = require("./jsx.js");
const literals_js_1 = require("./literals.js");
const string_js_1 = require("../globals/string.js");
function $assignmentExpression(node, parent, ctx, idx) {
    if (node === void 0) {
        return void 0;
    }
    switch (node.kind) {
        case typescript_1.SyntaxKind.AsExpression:
            return new expressions_js_1.$AsExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.BinaryExpression:
            return new expressions_js_1.$BinaryExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ArrowFunction:
            return new functions_js_1.$ArrowFunction(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ConditionalExpression:
            return new expressions_js_1.$ConditionalExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.YieldExpression:
            return new expressions_js_1.$YieldExpression(node, parent, ctx, idx);
        default:
            return $unaryExpression(node, parent, ctx, idx);
    }
}
exports.$assignmentExpression = $assignmentExpression;
function $unaryExpression(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.JsxElement:
            return new jsx_js_1.$JsxElement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.JsxFragment:
            return new jsx_js_1.$JsxFragment(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.JsxSelfClosingElement:
            return new jsx_js_1.$JsxSelfClosingElement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.PostfixUnaryExpression:
            return new expressions_js_1.$PostfixUnaryExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.PrefixUnaryExpression:
            return new expressions_js_1.$PrefixUnaryExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.AwaitExpression:
            return new expressions_js_1.$AwaitExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.DeleteExpression:
            return new expressions_js_1.$DeleteExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TypeAssertionExpression:
            return new expressions_js_1.$TypeAssertion(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TypeOfExpression:
            return new expressions_js_1.$TypeOfExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.VoidExpression:
            return new expressions_js_1.$VoidExpression(node, parent, ctx, idx);
        default:
            return $LHSExpression(node, parent, ctx, idx);
    }
}
exports.$unaryExpression = $unaryExpression;
function $LHSExpression(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.ArrayLiteralExpression:
            return new expressions_js_1.$ArrayLiteralExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ClassExpression:
            return new classes_js_1.$ClassExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.FunctionExpression:
            return new functions_js_1.$FunctionExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.Identifier:
            return new expressions_js_1.$Identifier(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.NewExpression:
            return new expressions_js_1.$NewExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ObjectLiteralExpression:
            return new expressions_js_1.$ObjectLiteralExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ParenthesizedExpression:
            return new expressions_js_1.$ParenthesizedExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TemplateExpression:
            return new expressions_js_1.$TemplateExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ElementAccessExpression:
            return new expressions_js_1.$ElementAccessExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.NonNullExpression:
            return new expressions_js_1.$NonNullExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.PropertyAccessExpression:
            return new expressions_js_1.$PropertyAccessExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TaggedTemplateExpression:
            return new expressions_js_1.$TaggedTemplateExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.CallExpression:
            return new expressions_js_1.$CallExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.MetaProperty:
            return new expressions_js_1.$MetaProperty(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ThisKeyword:
            return new expressions_js_1.$ThisExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.SuperKeyword:
            return new expressions_js_1.$SuperExpression(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.NumericLiteral:
            return new literals_js_1.$NumericLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.BigIntLiteral:
            return new literals_js_1.$BigIntLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.StringLiteral:
            return new literals_js_1.$StringLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.RegularExpressionLiteral:
            return new literals_js_1.$RegularExpressionLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.NoSubstitutionTemplateLiteral:
            return new literals_js_1.$NoSubstitutionTemplateLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.NullKeyword:
            return new literals_js_1.$NullLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TrueKeyword:
        case typescript_1.SyntaxKind.FalseKeyword:
            return new literals_js_1.$BooleanLiteral(node, parent, ctx, idx);
        default:
            throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
    }
}
exports.$LHSExpression = $LHSExpression;
function $identifier(node, parent, ctx, idx) {
    if (node === void 0) {
        return void 0;
    }
    return new expressions_js_1.$Identifier(node, parent, ctx, idx);
}
exports.$identifier = $identifier;
function $$propertyName(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.Identifier:
            return new expressions_js_1.$Identifier(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.StringLiteral:
            return new literals_js_1.$StringLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.NumericLiteral:
            return new literals_js_1.$NumericLiteral(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ComputedPropertyName:
            return new bindings_js_1.$ComputedPropertyName(node, parent, ctx, idx);
    }
}
exports.$$propertyName = $$propertyName;
function $$bindingName(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.Identifier:
            return new expressions_js_1.$Identifier(node, parent, ctx | 8 /* IsBindingName */, idx);
        case typescript_1.SyntaxKind.ObjectBindingPattern:
            return new bindings_js_1.$ObjectBindingPattern(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ArrayBindingPattern:
            return new bindings_js_1.$ArrayBindingPattern(node, parent, ctx, idx);
    }
}
exports.$$bindingName = $$bindingName;
function $$esStatement(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.Block:
            return new statements_js_1.$Block(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.EmptyStatement:
            return new statements_js_1.$EmptyStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ExpressionStatement:
            return new statements_js_1.$ExpressionStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.IfStatement:
            return new statements_js_1.$IfStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.DoStatement:
            return new statements_js_1.$DoStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.WhileStatement:
            return new statements_js_1.$WhileStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ForStatement:
            return new statements_js_1.$ForStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ForInStatement:
            return new statements_js_1.$ForInStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ForOfStatement:
            return new statements_js_1.$ForOfStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ContinueStatement:
            return new statements_js_1.$ContinueStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.BreakStatement:
            return new statements_js_1.$BreakStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ReturnStatement:
            return new statements_js_1.$ReturnStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.WithStatement:
            return new statements_js_1.$WithStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.SwitchStatement:
            return new statements_js_1.$SwitchStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.LabeledStatement:
            return new statements_js_1.$LabeledStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ThrowStatement:
            return new statements_js_1.$ThrowStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TryStatement:
            return new statements_js_1.$TryStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.DebuggerStatement:
            return new statements_js_1.$DebuggerStatement(node, parent, ctx, idx);
        default:
            throw new Error(`Unexpected syntax node: ${typescript_1.SyntaxKind[node.kind]}.`);
    }
}
exports.$$esStatement = $$esStatement;
function $$tsStatementListItem(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.VariableStatement:
            return new statements_js_1.$VariableStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.FunctionDeclaration:
            return new functions_js_1.$FunctionDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.ClassDeclaration:
            return new classes_js_1.$ClassDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.InterfaceDeclaration:
            return new types_js_1.$InterfaceDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.TypeAliasDeclaration:
            return new types_js_1.$TypeAliasDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.EnumDeclaration:
            return new types_js_1.$EnumDeclaration(node, parent, ctx, idx);
        default:
            return $$esStatement(node, parent, ctx, idx);
    }
}
exports.$$tsStatementListItem = $$tsStatementListItem;
function $$tsStatementList(nodes, parent, ctx) {
    const len = nodes.length;
    let node;
    const $nodes = [];
    let x = 0;
    for (let i = 0; i < len; ++i) {
        node = nodes[i];
        if (node.kind === typescript_1.SyntaxKind.FunctionDeclaration && node.body === void 0) {
            continue;
        }
        $nodes[x] = $$tsStatementListItem(node, parent, ctx, x);
        ++x;
    }
    return $nodes;
}
exports.$$tsStatementList = $$tsStatementList;
function $$esLabelledItem(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.VariableStatement:
            return new statements_js_1.$VariableStatement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.FunctionDeclaration:
            return new functions_js_1.$FunctionDeclaration(node, parent, ctx, idx);
        default:
            return $$esStatement(node, parent, ctx, idx);
    }
}
exports.$$esLabelledItem = $$esLabelledItem;
// #endregion
// #region AST helpers
function GetDirectivePrologue(statements) {
    let directivePrologue = kernel_1.emptyArray;
    let statement;
    const len = statements.length;
    for (let i = 0; i < len; ++i) {
        statement = statements[i];
        if (statement.kind === typescript_1.SyntaxKind.ExpressionStatement
            && statement.expression.kind === typescript_1.SyntaxKind.StringLiteral) {
            if (directivePrologue === kernel_1.emptyArray) {
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
exports.GetDirectivePrologue = GetDirectivePrologue;
function GetExpectedArgumentCount(params) {
    for (let i = 0, ii = params.length; i < ii; ++i) {
        if (params[i].HasInitializer) {
            return i;
        }
    }
    return params.length;
}
exports.GetExpectedArgumentCount = GetExpectedArgumentCount;
function evaluateStatement(ctx, statement) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    let stmtCompletion = intrinsics.empty;
    switch (statement.$kind) {
        case typescript_1.SyntaxKind.Block:
        case typescript_1.SyntaxKind.VariableStatement:
        case typescript_1.SyntaxKind.EmptyStatement:
        case typescript_1.SyntaxKind.ExpressionStatement:
        case typescript_1.SyntaxKind.IfStatement:
        case typescript_1.SyntaxKind.SwitchStatement:
        case typescript_1.SyntaxKind.ContinueStatement:
        case typescript_1.SyntaxKind.BreakStatement:
        case typescript_1.SyntaxKind.ReturnStatement:
        case typescript_1.SyntaxKind.WithStatement:
        case typescript_1.SyntaxKind.LabeledStatement:
        case typescript_1.SyntaxKind.ThrowStatement:
        case typescript_1.SyntaxKind.TryStatement:
        case typescript_1.SyntaxKind.DebuggerStatement:
        case typescript_1.SyntaxKind.FunctionDeclaration:
            stmtCompletion = statement.Evaluate(ctx);
            break;
        case typescript_1.SyntaxKind.DoStatement:
        case typescript_1.SyntaxKind.WhileStatement:
        case typescript_1.SyntaxKind.ForStatement:
        case typescript_1.SyntaxKind.ForInStatement:
        case typescript_1.SyntaxKind.ForOfStatement:
            stmtCompletion = statement.EvaluateLabelled(ctx, new string_js_1.$StringSet());
            break;
        // Note that no default case is needed here as the cases above are exhausetive $$ESStatement (http://www.ecma-international.org/ecma-262/#prod-Statement)
    }
    return stmtCompletion;
}
exports.evaluateStatement = evaluateStatement;
// http://www.ecma-international.org/ecma-262/#sec-block-runtime-semantics-evaluation
// StatementList : StatementList StatementListItem
function evaluateStatementList(ctx, statements) {
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
exports.evaluateStatementList = evaluateStatementList;
// http://www.ecma-international.org/ecma-262/#sec-blockdeclarationinstantiation
function BlockDeclarationInstantiation(ctx, lexicallyScopedDeclarations, envRec) {
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
        if (dkind === typescript_1.SyntaxKind.FunctionDeclaration /* || dkind === SyntaxKind.GeneratorDeclaration || dkind === SyntaxKind.AsyncFunctionDeclaration || dkind === SyntaxKind.AsyncGeneratorDeclaration */) {
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
exports.BlockDeclarationInstantiation = BlockDeclarationInstantiation;
// http://www.ecma-international.org/ecma-262/#sec-isconstructor
function IsConstructor(ctx, argument) {
    const intrinsics = ctx.Realm['[[Intrinsics]]'];
    // 1. If Type(argument) is not Object, return false.
    if (!argument.isObject) {
        return intrinsics.false.GetValue(ctx)['[[Value]]'];
    }
    // 2. If argument has a [[Construct]] internal method, return true.
    if (argument instanceof function_js_1.$Function && argument['[[Construct]]'] !== void 0) {
        return intrinsics.true.GetValue(ctx)['[[Value]]'];
    }
    // 3. Return false.
    return intrinsics.false.GetValue(ctx)['[[Value]]'];
}
exports.IsConstructor = IsConstructor;
function $decoratorList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    if (nodes.length === 1) {
        return [new expressions_js_1.$Decorator(nodes[0], parent, ctx, 0)];
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new expressions_js_1.$Decorator(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$decoratorList = $decoratorList;
// Simple property accessors used for some map/flatMap/some/every operations,
// to avoid allocating a new arrow function for each of those calls.
function getContainsExpression(obj) { return obj.ContainsExpression; }
exports.getContainsExpression = getContainsExpression;
function getHasInitializer(obj) { return obj.HasInitializer; }
exports.getHasInitializer = getHasInitializer;
function getIsSimpleParameterList(obj) { return obj.IsSimpleParameterList; }
exports.getIsSimpleParameterList = getIsSimpleParameterList;
function getBoundNames(obj) { return obj.BoundNames; }
exports.getBoundNames = getBoundNames;
function getLexicallyDeclaredNames(obj) { return obj.LexicallyDeclaredNames; }
exports.getLexicallyDeclaredNames = getLexicallyDeclaredNames;
function getLexicallyScopedDeclarations(obj) { return obj.LexicallyScopedDeclarations; }
exports.getLexicallyScopedDeclarations = getLexicallyScopedDeclarations;
function getVarDeclaredNames(obj) { return obj.VarDeclaredNames; }
exports.getVarDeclaredNames = getVarDeclaredNames;
function getVarScopedDeclarations(obj) { return obj.VarScopedDeclarations; }
exports.getVarScopedDeclarations = getVarScopedDeclarations;
function getLocalName(obj) { return obj.LocalName; }
exports.getLocalName = getLocalName;
function getImportEntriesForModule(obj) { return obj.ImportEntriesForModule; }
exports.getImportEntriesForModule = getImportEntriesForModule;
function getExportedNames(obj) { return obj.ExportedNames; }
exports.getExportedNames = getExportedNames;
function getExportEntriesForModule(obj) { return obj.ExportEntriesForModule; }
exports.getExportEntriesForModule = getExportEntriesForModule;
function getReferencedBindings(obj) { return obj.ReferencedBindings; }
exports.getReferencedBindings = getReferencedBindings;
function $heritageClauseList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
    }
    const len = nodes.length;
    const $nodes = Array(len);
    for (let i = 0; i < len; ++i) {
        $nodes[i] = new classes_js_1.$HeritageClause(nodes[i], parent, ctx, i);
    }
    return $nodes;
}
exports.$heritageClauseList = $heritageClauseList;
function $$classElementList(nodes, parent, ctx) {
    if (nodes === void 0 || nodes.length === 0) {
        return kernel_1.emptyArray;
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
exports.$$classElementList = $$classElementList;
function $$classElement(node, parent, ctx, idx) {
    switch (node.kind) {
        case typescript_1.SyntaxKind.PropertyDeclaration:
            return new classes_js_1.$PropertyDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.SemicolonClassElement:
            return new classes_js_1.$SemicolonClassElement(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.MethodDeclaration:
            return new methods_js_1.$MethodDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.Constructor:
            return new functions_js_1.$ConstructorDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.GetAccessor:
            return new methods_js_1.$GetAccessorDeclaration(node, parent, ctx, idx);
        case typescript_1.SyntaxKind.SetAccessor:
            return new methods_js_1.$SetAccessorDeclaration(node, parent, ctx, idx);
        default:
            return void 0;
    }
}
exports.$$classElement = $$classElement;
// #endregion
function hasBit(flag, bit) {
    return (flag & bit) > 0;
}
exports.hasBit = hasBit;
function hasAllBits(flag, bit) {
    return (flag & bit) === bit;
}
exports.hasAllBits = hasAllBits;
function clearBit(flag, bit) {
    return (flag | bit) ^ bit;
}
exports.clearBit = clearBit;
var Context;
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
})(Context = exports.Context || (exports.Context = {}));
exports.modifiersToModifierFlags = (function () {
    const lookup = Object.assign(Object.create(null), {
        [typescript_1.SyntaxKind.ConstKeyword]: typescript_1.ModifierFlags.Const,
        [typescript_1.SyntaxKind.DefaultKeyword]: typescript_1.ModifierFlags.Default,
        [typescript_1.SyntaxKind.ExportKeyword]: typescript_1.ModifierFlags.Export,
        [typescript_1.SyntaxKind.AsyncKeyword]: typescript_1.ModifierFlags.Async,
        [typescript_1.SyntaxKind.PrivateKeyword]: typescript_1.ModifierFlags.Private,
        [typescript_1.SyntaxKind.ProtectedKeyword]: typescript_1.ModifierFlags.Protected,
        [typescript_1.SyntaxKind.PublicKeyword]: typescript_1.ModifierFlags.Public,
        [typescript_1.SyntaxKind.StaticKeyword]: typescript_1.ModifierFlags.Static,
        [typescript_1.SyntaxKind.AbstractKeyword]: typescript_1.ModifierFlags.Abstract,
        [typescript_1.SyntaxKind.DeclareKeyword]: typescript_1.ModifierFlags.Ambient,
        [typescript_1.SyntaxKind.ReadonlyKeyword]: typescript_1.ModifierFlags.Readonly,
    });
    return function (mods) {
        if (mods === void 0) {
            return typescript_1.ModifierFlags.None;
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
var FunctionKind;
(function (FunctionKind) {
    FunctionKind[FunctionKind["normal"] = 0] = "normal";
    FunctionKind[FunctionKind["nonConstructor"] = 1] = "nonConstructor";
    FunctionKind[FunctionKind["classConstructor"] = 2] = "classConstructor";
    FunctionKind[FunctionKind["generator"] = 4] = "generator";
    FunctionKind[FunctionKind["async"] = 8] = "async";
    FunctionKind[FunctionKind["asyncGenerator"] = 12] = "asyncGenerator";
})(FunctionKind = exports.FunctionKind || (exports.FunctionKind = {}));
/**
 * Returns the indexed string representation, or an empty string if the number is -1.
 */
function $i(idx) {
    return idx === -1 ? '' : `[${idx}]`;
}
exports.$i = $i;
//# sourceMappingURL=_shared.js.map