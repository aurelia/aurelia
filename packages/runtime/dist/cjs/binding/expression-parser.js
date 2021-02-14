"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseExpression = exports.ParserState = exports.BindingType = exports.Precedence = exports.Access = exports.Char = exports.ExpressionParser = exports.IExpressionParser = void 0;
const kernel_1 = require("@aurelia/kernel");
const ast_js_1 = require("./ast.js");
exports.IExpressionParser = kernel_1.DI.createInterface('IExpressionParser', x => x.singleton(ExpressionParser));
class ExpressionParser {
    constructor() {
        this.expressionLookup = Object.create(null);
        this.forOfLookup = Object.create(null);
        this.interpolationLookup = Object.create(null);
    }
    parse(expression, bindingType) {
        switch (bindingType) {
            case 2048 /* Interpolation */: {
                let found = this.interpolationLookup[expression];
                if (found === void 0) {
                    found = this.interpolationLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
            case 539 /* ForCommand */: {
                let found = this.forOfLookup[expression];
                if (found === void 0) {
                    found = this.forOfLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
            default: {
                // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                // But don't cache it, because empty strings are always invalid for any other type of binding
                if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                    return ast_js_1.PrimitiveLiteralExpression.$empty;
                }
                let found = this.expressionLookup[expression];
                if (found === void 0) {
                    found = this.expressionLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
        }
    }
    $parse(expression, bindingType) {
        $state.input = expression;
        $state.length = expression.length;
        $state.index = 0;
        $state.currentChar = expression.charCodeAt(0);
        return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
    }
}
exports.ExpressionParser = ExpressionParser;
var Char;
(function (Char) {
    Char[Char["Null"] = 0] = "Null";
    Char[Char["Backspace"] = 8] = "Backspace";
    Char[Char["Tab"] = 9] = "Tab";
    Char[Char["LineFeed"] = 10] = "LineFeed";
    Char[Char["VerticalTab"] = 11] = "VerticalTab";
    Char[Char["FormFeed"] = 12] = "FormFeed";
    Char[Char["CarriageReturn"] = 13] = "CarriageReturn";
    Char[Char["Space"] = 32] = "Space";
    Char[Char["Exclamation"] = 33] = "Exclamation";
    Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
    Char[Char["Dollar"] = 36] = "Dollar";
    Char[Char["Percent"] = 37] = "Percent";
    Char[Char["Ampersand"] = 38] = "Ampersand";
    Char[Char["SingleQuote"] = 39] = "SingleQuote";
    Char[Char["OpenParen"] = 40] = "OpenParen";
    Char[Char["CloseParen"] = 41] = "CloseParen";
    Char[Char["Asterisk"] = 42] = "Asterisk";
    Char[Char["Plus"] = 43] = "Plus";
    Char[Char["Comma"] = 44] = "Comma";
    Char[Char["Minus"] = 45] = "Minus";
    Char[Char["Dot"] = 46] = "Dot";
    Char[Char["Slash"] = 47] = "Slash";
    Char[Char["Semicolon"] = 59] = "Semicolon";
    Char[Char["Backtick"] = 96] = "Backtick";
    Char[Char["OpenBracket"] = 91] = "OpenBracket";
    Char[Char["Backslash"] = 92] = "Backslash";
    Char[Char["CloseBracket"] = 93] = "CloseBracket";
    Char[Char["Caret"] = 94] = "Caret";
    Char[Char["Underscore"] = 95] = "Underscore";
    Char[Char["OpenBrace"] = 123] = "OpenBrace";
    Char[Char["Bar"] = 124] = "Bar";
    Char[Char["CloseBrace"] = 125] = "CloseBrace";
    Char[Char["Colon"] = 58] = "Colon";
    Char[Char["LessThan"] = 60] = "LessThan";
    Char[Char["Equals"] = 61] = "Equals";
    Char[Char["GreaterThan"] = 62] = "GreaterThan";
    Char[Char["Question"] = 63] = "Question";
    Char[Char["Zero"] = 48] = "Zero";
    Char[Char["One"] = 49] = "One";
    Char[Char["Two"] = 50] = "Two";
    Char[Char["Three"] = 51] = "Three";
    Char[Char["Four"] = 52] = "Four";
    Char[Char["Five"] = 53] = "Five";
    Char[Char["Six"] = 54] = "Six";
    Char[Char["Seven"] = 55] = "Seven";
    Char[Char["Eight"] = 56] = "Eight";
    Char[Char["Nine"] = 57] = "Nine";
    Char[Char["UpperA"] = 65] = "UpperA";
    Char[Char["UpperB"] = 66] = "UpperB";
    Char[Char["UpperC"] = 67] = "UpperC";
    Char[Char["UpperD"] = 68] = "UpperD";
    Char[Char["UpperE"] = 69] = "UpperE";
    Char[Char["UpperF"] = 70] = "UpperF";
    Char[Char["UpperG"] = 71] = "UpperG";
    Char[Char["UpperH"] = 72] = "UpperH";
    Char[Char["UpperI"] = 73] = "UpperI";
    Char[Char["UpperJ"] = 74] = "UpperJ";
    Char[Char["UpperK"] = 75] = "UpperK";
    Char[Char["UpperL"] = 76] = "UpperL";
    Char[Char["UpperM"] = 77] = "UpperM";
    Char[Char["UpperN"] = 78] = "UpperN";
    Char[Char["UpperO"] = 79] = "UpperO";
    Char[Char["UpperP"] = 80] = "UpperP";
    Char[Char["UpperQ"] = 81] = "UpperQ";
    Char[Char["UpperR"] = 82] = "UpperR";
    Char[Char["UpperS"] = 83] = "UpperS";
    Char[Char["UpperT"] = 84] = "UpperT";
    Char[Char["UpperU"] = 85] = "UpperU";
    Char[Char["UpperV"] = 86] = "UpperV";
    Char[Char["UpperW"] = 87] = "UpperW";
    Char[Char["UpperX"] = 88] = "UpperX";
    Char[Char["UpperY"] = 89] = "UpperY";
    Char[Char["UpperZ"] = 90] = "UpperZ";
    Char[Char["LowerA"] = 97] = "LowerA";
    Char[Char["LowerB"] = 98] = "LowerB";
    Char[Char["LowerC"] = 99] = "LowerC";
    Char[Char["LowerD"] = 100] = "LowerD";
    Char[Char["LowerE"] = 101] = "LowerE";
    Char[Char["LowerF"] = 102] = "LowerF";
    Char[Char["LowerG"] = 103] = "LowerG";
    Char[Char["LowerH"] = 104] = "LowerH";
    Char[Char["LowerI"] = 105] = "LowerI";
    Char[Char["LowerJ"] = 106] = "LowerJ";
    Char[Char["LowerK"] = 107] = "LowerK";
    Char[Char["LowerL"] = 108] = "LowerL";
    Char[Char["LowerM"] = 109] = "LowerM";
    Char[Char["LowerN"] = 110] = "LowerN";
    Char[Char["LowerO"] = 111] = "LowerO";
    Char[Char["LowerP"] = 112] = "LowerP";
    Char[Char["LowerQ"] = 113] = "LowerQ";
    Char[Char["LowerR"] = 114] = "LowerR";
    Char[Char["LowerS"] = 115] = "LowerS";
    Char[Char["LowerT"] = 116] = "LowerT";
    Char[Char["LowerU"] = 117] = "LowerU";
    Char[Char["LowerV"] = 118] = "LowerV";
    Char[Char["LowerW"] = 119] = "LowerW";
    Char[Char["LowerX"] = 120] = "LowerX";
    Char[Char["LowerY"] = 121] = "LowerY";
    Char[Char["LowerZ"] = 122] = "LowerZ";
})(Char = exports.Char || (exports.Char = {}));
function unescapeCode(code) {
    switch (code) {
        case 98 /* LowerB */: return 8 /* Backspace */;
        case 116 /* LowerT */: return 9 /* Tab */;
        case 110 /* LowerN */: return 10 /* LineFeed */;
        case 118 /* LowerV */: return 11 /* VerticalTab */;
        case 102 /* LowerF */: return 12 /* FormFeed */;
        case 114 /* LowerR */: return 13 /* CarriageReturn */;
        case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
        case 39 /* SingleQuote */: return 39 /* SingleQuote */;
        case 92 /* Backslash */: return 92 /* Backslash */;
        default: return code;
    }
}
var Access;
(function (Access) {
    Access[Access["Reset"] = 0] = "Reset";
    Access[Access["Ancestor"] = 511] = "Ancestor";
    Access[Access["This"] = 512] = "This";
    Access[Access["Scope"] = 1024] = "Scope";
    Access[Access["Member"] = 2048] = "Member";
    Access[Access["Keyed"] = 4096] = "Keyed";
})(Access = exports.Access || (exports.Access = {}));
var Precedence;
(function (Precedence) {
    Precedence[Precedence["Variadic"] = 61] = "Variadic";
    Precedence[Precedence["Assign"] = 62] = "Assign";
    Precedence[Precedence["Conditional"] = 63] = "Conditional";
    Precedence[Precedence["LogicalOR"] = 64] = "LogicalOR";
    Precedence[Precedence["LogicalAND"] = 128] = "LogicalAND";
    Precedence[Precedence["Equality"] = 192] = "Equality";
    Precedence[Precedence["Relational"] = 256] = "Relational";
    Precedence[Precedence["Additive"] = 320] = "Additive";
    Precedence[Precedence["Multiplicative"] = 384] = "Multiplicative";
    Precedence[Precedence["Binary"] = 448] = "Binary";
    Precedence[Precedence["LeftHandSide"] = 449] = "LeftHandSide";
    Precedence[Precedence["Primary"] = 450] = "Primary";
    Precedence[Precedence["Unary"] = 451] = "Unary";
})(Precedence = exports.Precedence || (exports.Precedence = {}));
var Token;
(function (Token) {
    Token[Token["EOF"] = 1572864] = "EOF";
    Token[Token["ExpressionTerminal"] = 1048576] = "ExpressionTerminal";
    Token[Token["AccessScopeTerminal"] = 524288] = "AccessScopeTerminal";
    Token[Token["ClosingToken"] = 262144] = "ClosingToken";
    Token[Token["OpeningToken"] = 131072] = "OpeningToken";
    Token[Token["BinaryOp"] = 65536] = "BinaryOp";
    Token[Token["UnaryOp"] = 32768] = "UnaryOp";
    Token[Token["LeftHandSide"] = 16384] = "LeftHandSide";
    Token[Token["StringOrNumericLiteral"] = 12288] = "StringOrNumericLiteral";
    Token[Token["NumericLiteral"] = 8192] = "NumericLiteral";
    Token[Token["StringLiteral"] = 4096] = "StringLiteral";
    Token[Token["IdentifierName"] = 3072] = "IdentifierName";
    Token[Token["Keyword"] = 2048] = "Keyword";
    Token[Token["Identifier"] = 1024] = "Identifier";
    Token[Token["Contextual"] = 512] = "Contextual";
    Token[Token["Precedence"] = 448] = "Precedence";
    Token[Token["Type"] = 63] = "Type";
    Token[Token["FalseKeyword"] = 2048] = "FalseKeyword";
    Token[Token["TrueKeyword"] = 2049] = "TrueKeyword";
    Token[Token["NullKeyword"] = 2050] = "NullKeyword";
    Token[Token["UndefinedKeyword"] = 2051] = "UndefinedKeyword";
    Token[Token["ThisScope"] = 3076] = "ThisScope";
    Token[Token["HostScope"] = 3077] = "HostScope";
    Token[Token["ParentScope"] = 3078] = "ParentScope";
    Token[Token["OpenParen"] = 671751] = "OpenParen";
    Token[Token["OpenBrace"] = 131080] = "OpenBrace";
    Token[Token["Dot"] = 16393] = "Dot";
    Token[Token["CloseBrace"] = 1835018] = "CloseBrace";
    Token[Token["CloseParen"] = 1835019] = "CloseParen";
    Token[Token["Comma"] = 1572876] = "Comma";
    Token[Token["OpenBracket"] = 671757] = "OpenBracket";
    Token[Token["CloseBracket"] = 1835022] = "CloseBracket";
    Token[Token["Colon"] = 1572879] = "Colon";
    Token[Token["Question"] = 1572880] = "Question";
    Token[Token["Ampersand"] = 1572883] = "Ampersand";
    Token[Token["Bar"] = 1572884] = "Bar";
    Token[Token["BarBar"] = 1638549] = "BarBar";
    Token[Token["AmpersandAmpersand"] = 1638614] = "AmpersandAmpersand";
    Token[Token["EqualsEquals"] = 1638679] = "EqualsEquals";
    Token[Token["ExclamationEquals"] = 1638680] = "ExclamationEquals";
    Token[Token["EqualsEqualsEquals"] = 1638681] = "EqualsEqualsEquals";
    Token[Token["ExclamationEqualsEquals"] = 1638682] = "ExclamationEqualsEquals";
    Token[Token["LessThan"] = 1638747] = "LessThan";
    Token[Token["GreaterThan"] = 1638748] = "GreaterThan";
    Token[Token["LessThanEquals"] = 1638749] = "LessThanEquals";
    Token[Token["GreaterThanEquals"] = 1638750] = "GreaterThanEquals";
    Token[Token["InKeyword"] = 1640799] = "InKeyword";
    Token[Token["InstanceOfKeyword"] = 1640800] = "InstanceOfKeyword";
    Token[Token["Plus"] = 623009] = "Plus";
    Token[Token["Minus"] = 623010] = "Minus";
    Token[Token["TypeofKeyword"] = 34851] = "TypeofKeyword";
    Token[Token["VoidKeyword"] = 34852] = "VoidKeyword";
    Token[Token["Asterisk"] = 1638885] = "Asterisk";
    Token[Token["Percent"] = 1638886] = "Percent";
    Token[Token["Slash"] = 1638887] = "Slash";
    Token[Token["Equals"] = 1048616] = "Equals";
    Token[Token["Exclamation"] = 32809] = "Exclamation";
    Token[Token["TemplateTail"] = 540714] = "TemplateTail";
    Token[Token["TemplateContinuation"] = 540715] = "TemplateContinuation";
    Token[Token["OfKeyword"] = 1051180] = "OfKeyword";
})(Token || (Token = {}));
const $false = ast_js_1.PrimitiveLiteralExpression.$false;
const $true = ast_js_1.PrimitiveLiteralExpression.$true;
const $null = ast_js_1.PrimitiveLiteralExpression.$null;
const $undefined = ast_js_1.PrimitiveLiteralExpression.$undefined;
const $this = ast_js_1.AccessThisExpression.$this;
const $host = ast_js_1.AccessThisExpression.$host;
const $parent = ast_js_1.AccessThisExpression.$parent;
var BindingType;
(function (BindingType) {
    BindingType[BindingType["None"] = 0] = "None";
    // if a binding command is taking over the processing of an attribute
    // then it should add this flag to its binding type
    // which then tell the binder to proceed the attribute compilation as is,
    // instead of normal process: transformation -> compilation
    BindingType[BindingType["IgnoreAttr"] = 4096] = "IgnoreAttr";
    BindingType[BindingType["Interpolation"] = 2048] = "Interpolation";
    BindingType[BindingType["IsRef"] = 5376] = "IsRef";
    BindingType[BindingType["IsIterator"] = 512] = "IsIterator";
    BindingType[BindingType["IsCustom"] = 256] = "IsCustom";
    BindingType[BindingType["IsFunction"] = 128] = "IsFunction";
    BindingType[BindingType["IsEvent"] = 64] = "IsEvent";
    BindingType[BindingType["IsProperty"] = 32] = "IsProperty";
    BindingType[BindingType["IsCommand"] = 16] = "IsCommand";
    BindingType[BindingType["IsPropertyCommand"] = 48] = "IsPropertyCommand";
    BindingType[BindingType["IsEventCommand"] = 80] = "IsEventCommand";
    BindingType[BindingType["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
    BindingType[BindingType["Command"] = 15] = "Command";
    BindingType[BindingType["OneTimeCommand"] = 49] = "OneTimeCommand";
    BindingType[BindingType["ToViewCommand"] = 50] = "ToViewCommand";
    BindingType[BindingType["FromViewCommand"] = 51] = "FromViewCommand";
    BindingType[BindingType["TwoWayCommand"] = 52] = "TwoWayCommand";
    BindingType[BindingType["BindCommand"] = 53] = "BindCommand";
    BindingType[BindingType["TriggerCommand"] = 4182] = "TriggerCommand";
    BindingType[BindingType["CaptureCommand"] = 4183] = "CaptureCommand";
    BindingType[BindingType["DelegateCommand"] = 4184] = "DelegateCommand";
    BindingType[BindingType["CallCommand"] = 153] = "CallCommand";
    BindingType[BindingType["OptionsCommand"] = 26] = "OptionsCommand";
    BindingType[BindingType["ForCommand"] = 539] = "ForCommand";
    BindingType[BindingType["CustomCommand"] = 284] = "CustomCommand";
})(BindingType = exports.BindingType || (exports.BindingType = {}));
/* eslint-enable @typescript-eslint/indent */
/** @internal */
class ParserState {
    constructor(input) {
        this.input = input;
        this.index = 0;
        this.startIndex = 0;
        this.lastIndex = 0;
        this.currentToken = 1572864 /* EOF */;
        this.tokenValue = '';
        this.assignable = true;
        this.length = input.length;
        this.currentChar = input.charCodeAt(0);
    }
    get tokenRaw() {
        return this.input.slice(this.startIndex, this.index);
    }
}
exports.ParserState = ParserState;
const $state = new ParserState('');
/** @internal */
function parseExpression(input, bindingType) {
    $state.input = input;
    $state.length = input.length;
    $state.index = 0;
    $state.currentChar = input.charCodeAt(0);
    return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
}
exports.parseExpression = parseExpression;
/** @internal */
// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
function parse(state, access, minPrecedence, bindingType) {
    if (bindingType === 284 /* CustomCommand */) {
        return new ast_js_1.CustomExpression(state.input);
    }
    if (state.index === 0) {
        if (bindingType & 2048 /* Interpolation */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseInterpolation(state);
        }
        nextToken(state);
        if (state.currentToken & 1048576 /* ExpressionTerminal */) {
            throw new Error(`Invalid start of expression: '${state.input}'`);
        }
    }
    state.assignable = 448 /* Binary */ > minPrecedence;
    let result = void 0;
    if (state.currentToken & 32768 /* UnaryOp */) {
        /** parseUnaryExpression
         * https://tc39.github.io/ecma262/#sec-unary-operators
         *
         * UnaryExpression :
         * 1. LeftHandSideExpression
         * 2. void UnaryExpression
         * 3. typeof UnaryExpression
         * 4. + UnaryExpression
         * 5. - UnaryExpression
         * 6. ! UnaryExpression
         *
         * IsValidAssignmentTarget
         * 2,3,4,5,6 = false
         * 1 = see parseLeftHandSideExpression
         *
         * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
         */
        const op = TokenValues[state.currentToken & 63 /* Type */];
        nextToken(state);
        result = new ast_js_1.UnaryExpression(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
        state.assignable = false;
    }
    else {
        /** parsePrimaryExpression
         * https://tc39.github.io/ecma262/#sec-primary-expression
         *
         * PrimaryExpression :
         * 1. this
         * 2. IdentifierName
         * 3. Literal
         * 4. ArrayLiteralExpression
         * 5. ObjectLiteralExpression
         * 6. TemplateLiteral
         * 7. ParenthesizedExpression
         *
         * Literal :
         * NullLiteral
         * BooleanLiteral
         * NumericLiteral
         * StringLiteral
         *
         * ParenthesizedExpression :
         * ( AssignmentExpression )
         *
         * IsValidAssignmentTarget
         * 1,3,4,5,6,7 = false
         * 2 = true
         */
        primary: switch (state.currentToken) {
            case 3078 /* ParentScope */: // $parent
                state.assignable = false;
                do {
                    nextToken(state);
                    access++; // ancestor
                    if (consumeOpt(state, 16393 /* Dot */)) {
                        if (state.currentToken === 16393 /* Dot */) {
                            throw new Error(`Double dot and spread operators are not supported: '${state.input}'`);
                        }
                        else if (state.currentToken === 1572864 /* EOF */) {
                            throw new Error(`Expected identifier: '${state.input}'`);
                        }
                    }
                    else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                        const ancestor = access & 511 /* Ancestor */;
                        result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new ast_js_1.AccessThisExpression(ancestor);
                        access = 512 /* This */;
                        break primary;
                    }
                    else {
                        throw new Error(`Invalid member expression: '${state.input}'`);
                    }
                } while (state.currentToken === 3078 /* ParentScope */);
            // falls through
            case 1024 /* Identifier */: // identifier
                if (bindingType & 512 /* IsIterator */) {
                    result = new ast_js_1.BindingIdentifier(state.tokenValue);
                }
                else {
                    result = new ast_js_1.AccessScopeExpression(state.tokenValue, access & 511 /* Ancestor */);
                    access = 1024 /* Scope */;
                }
                state.assignable = true;
                nextToken(state);
                break;
            case 3076 /* ThisScope */: // $this
                state.assignable = false;
                nextToken(state);
                result = $this;
                access = 512 /* This */;
                break;
            case 3077 /* HostScope */: // $host
                state.assignable = false;
                nextToken(state);
                result = $host;
                access = 512 /* This */;
                break;
            case 671751 /* OpenParen */: // parenthesized expression
                nextToken(state);
                result = parse(state, 0 /* Reset */, 62 /* Assign */, bindingType);
                consume(state, 1835019 /* CloseParen */);
                access = 0 /* Reset */;
                break;
            case 671757 /* OpenBracket */:
                result = parseArrayLiteralExpression(state, access, bindingType);
                access = 0 /* Reset */;
                break;
            case 131080 /* OpenBrace */:
                result = parseObjectLiteralExpression(state, bindingType);
                access = 0 /* Reset */;
                break;
            case 540714 /* TemplateTail */:
                result = new ast_js_1.TemplateExpression([state.tokenValue]);
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            case 540715 /* TemplateContinuation */:
                result = parseTemplate(state, access, bindingType, result, false);
                access = 0 /* Reset */;
                break;
            case 4096 /* StringLiteral */:
            case 8192 /* NumericLiteral */:
                result = new ast_js_1.PrimitiveLiteralExpression(state.tokenValue);
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            case 2050 /* NullKeyword */:
            case 2051 /* UndefinedKeyword */:
            case 2049 /* TrueKeyword */:
            case 2048 /* FalseKeyword */:
                result = TokenValues[state.currentToken & 63 /* Type */];
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            default:
                if (state.index >= state.length) {
                    throw new Error(`Unexpected end of expression: '${state.input}'`);
                }
                else {
                    throw new Error(`Unconsumed token: '${state.input}'`);
                }
        }
        if (bindingType & 512 /* IsIterator */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseForOfStatement(state, result);
        }
        if (449 /* LeftHandSide */ < minPrecedence) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
         * MemberExpression :
         * 1. PrimaryExpression
         * 2. MemberExpression [ AssignmentExpression ]
         * 3. MemberExpression . IdentifierName
         * 4. MemberExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,4 = false
         * 2,3 = true
         *
         *
         * parseCallExpression (Token.OpenParen)
         * CallExpression :
         * 1. MemberExpression Arguments
         * 2. CallExpression Arguments
         * 3. CallExpression [ AssignmentExpression ]
         * 4. CallExpression . IdentifierName
         * 5. CallExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,2,5 = false
         * 3,4 = true
         */
        let name = state.tokenValue;
        while ((state.currentToken & 16384 /* LeftHandSide */) > 0) {
            const args = [];
            let strings;
            switch (state.currentToken) {
                case 16393 /* Dot */:
                    state.assignable = true;
                    nextToken(state);
                    if ((state.currentToken & 3072 /* IdentifierName */) === 0) {
                        throw new Error(`Expected identifier: '${state.input}'`);
                    }
                    name = state.tokenValue;
                    nextToken(state);
                    // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                    access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                    if (state.currentToken === 671751 /* OpenParen */) {
                        if (access === 0 /* Reset */) { // if the left hand side is a literal, make sure we parse a CallMemberExpression
                            access = 2048 /* Member */;
                        }
                        continue;
                    }
                    if (access & 1024 /* Scope */) {
                        result = new ast_js_1.AccessScopeExpression(name, result.ancestor, result === $host);
                    }
                    else { // if it's not $Scope, it's $Member
                        result = new ast_js_1.AccessMemberExpression(result, name);
                    }
                    continue;
                case 671757 /* OpenBracket */:
                    state.assignable = true;
                    nextToken(state);
                    access = 4096 /* Keyed */;
                    result = new ast_js_1.AccessKeyedExpression(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                    consume(state, 1835022 /* CloseBracket */);
                    break;
                case 671751 /* OpenParen */:
                    state.assignable = false;
                    nextToken(state);
                    while (state.currentToken !== 1835019 /* CloseParen */) {
                        args.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                        if (!consumeOpt(state, 1572876 /* Comma */)) {
                            break;
                        }
                    }
                    consume(state, 1835019 /* CloseParen */);
                    if (access & 1024 /* Scope */) {
                        result = new ast_js_1.CallScopeExpression(name, args, result.ancestor, result === $host);
                    }
                    else if (access & 2048 /* Member */) {
                        result = new ast_js_1.CallMemberExpression(result, name, args);
                    }
                    else {
                        result = new ast_js_1.CallFunctionExpression(result, args);
                    }
                    access = 0;
                    break;
                case 540714 /* TemplateTail */:
                    state.assignable = false;
                    strings = [state.tokenValue];
                    result = new ast_js_1.TaggedTemplateExpression(strings, strings, result);
                    nextToken(state);
                    break;
                case 540715 /* TemplateContinuation */:
                    result = parseTemplate(state, access, bindingType, result, true);
                default:
            }
        }
    }
    if (448 /* Binary */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseBinaryExpression
     * https://tc39.github.io/ecma262/#sec-multiplicative-operators
     *
     * MultiplicativeExpression : (local precedence 6)
     * UnaryExpression
     * MultiplicativeExpression * / % UnaryExpression
     *
     * AdditiveExpression : (local precedence 5)
     * MultiplicativeExpression
     * AdditiveExpression + - MultiplicativeExpression
     *
     * RelationalExpression : (local precedence 4)
     * AdditiveExpression
     * RelationalExpression < > <= >= instanceof in AdditiveExpression
     *
     * EqualityExpression : (local precedence 3)
     * RelationalExpression
     * EqualityExpression == != === !== RelationalExpression
     *
     * LogicalANDExpression : (local precedence 2)
     * EqualityExpression
     * LogicalANDExpression && EqualityExpression
     *
     * LogicalORExpression : (local precedence 1)
     * LogicalANDExpression
     * LogicalORExpression || LogicalANDExpression
     */
    while ((state.currentToken & 65536 /* BinaryOp */) > 0) {
        const opToken = state.currentToken;
        if ((opToken & 448 /* Precedence */) <= minPrecedence) {
            break;
        }
        nextToken(state);
        result = new ast_js_1.BinaryExpression(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
        state.assignable = false;
    }
    if (63 /* Conditional */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseConditionalExpression
     * https://tc39.github.io/ecma262/#prod-ConditionalExpression
     *
     * ConditionalExpression :
     * 1. BinaryExpression
     * 2. BinaryExpression ? AssignmentExpression : AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(state, 1572880 /* Question */)) {
        const yes = parse(state, access, 62 /* Assign */, bindingType);
        consume(state, 1572879 /* Colon */);
        result = new ast_js_1.ConditionalExpression(result, yes, parse(state, access, 62 /* Assign */, bindingType));
        state.assignable = false;
    }
    if (62 /* Assign */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseAssignmentExpression
     * https://tc39.github.io/ecma262/#prod-AssignmentExpression
     * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
     *
     * AssignmentExpression :
     * 1. ConditionalExpression
     * 2. LeftHandSideExpression = AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(state, 1048616 /* Equals */)) {
        if (!state.assignable) {
            throw new Error(`Left hand side of expression is not assignable: '${state.input}'`);
        }
        result = new ast_js_1.AssignExpression(result, parse(state, access, 62 /* Assign */, bindingType));
    }
    if (61 /* Variadic */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseValueConverter
     */
    while (consumeOpt(state, 1572884 /* Bar */)) {
        if (state.currentToken === 1572864 /* EOF */) {
            throw new Error(`Expected identifier to come after ValueConverter operator: '${state.input}'`);
        }
        const name = state.tokenValue;
        nextToken(state);
        const args = new Array();
        while (consumeOpt(state, 1572879 /* Colon */)) {
            args.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        result = new ast_js_1.ValueConverterExpression(result, name, args);
    }
    /** parseBindingBehavior
     */
    while (consumeOpt(state, 1572883 /* Ampersand */)) {
        if (state.currentToken === 1572864 /* EOF */) {
            throw new Error(`Expected identifier to come after BindingBehavior operator: '${state.input}'`);
        }
        const name = state.tokenValue;
        nextToken(state);
        const args = new Array();
        while (consumeOpt(state, 1572879 /* Colon */)) {
            args.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        result = new ast_js_1.BindingBehaviorExpression(result, name, args);
    }
    if (state.currentToken !== 1572864 /* EOF */) {
        if (bindingType & 2048 /* Interpolation */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        if (state.tokenRaw === 'of') {
            throw new Error(`Unexpected keyword "of": '${state.input}'`);
        }
        throw new Error(`Unconsumed token: '${state.input}'`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result;
}
exports.parse = parse;
/**
 * parseArrayLiteralExpression
 * https://tc39.github.io/ecma262/#prod-ArrayLiteralExpression
 *
 * ArrayLiteralExpression :
 * [ Elision(opt) ]
 * [ ElementList ]
 * [ ElementList, Elision(opt) ]
 *
 * ElementList :
 * Elision(opt) AssignmentExpression
 * ElementList, Elision(opt) AssignmentExpression
 *
 * Elision :
 * ,
 * Elision ,
 */
function parseArrayLiteralExpression(state, access, bindingType) {
    nextToken(state);
    const elements = new Array();
    while (state.currentToken !== 1835022 /* CloseBracket */) {
        if (consumeOpt(state, 1572876 /* Comma */)) {
            elements.push($undefined);
            if (state.currentToken === 1835022 /* CloseBracket */) {
                break;
            }
        }
        else {
            elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            if (consumeOpt(state, 1572876 /* Comma */)) {
                if (state.currentToken === 1835022 /* CloseBracket */) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    consume(state, 1835022 /* CloseBracket */);
    if (bindingType & 512 /* IsIterator */) {
        return new ast_js_1.ArrayBindingPattern(elements);
    }
    else {
        state.assignable = false;
        return new ast_js_1.ArrayLiteralExpression(elements);
    }
}
function parseForOfStatement(state, result) {
    if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
        throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.input}'`);
    }
    if (state.currentToken !== 1051180 /* OfKeyword */) {
        throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.input}'`);
    }
    nextToken(state);
    const declaration = result;
    const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
    return new ast_js_1.ForOfStatement(declaration, statement);
}
/**
 * parseObjectLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * ObjectLiteralExpression :
 * { }
 * { PropertyDefinitionList }
 *
 * PropertyDefinitionList :
 * PropertyDefinition
 * PropertyDefinitionList, PropertyDefinition
 *
 * PropertyDefinition :
 * IdentifierName
 * PropertyName : AssignmentExpression
 *
 * PropertyName :
 * IdentifierName
 * StringLiteral
 * NumericLiteral
 */
function parseObjectLiteralExpression(state, bindingType) {
    const keys = new Array();
    const values = new Array();
    nextToken(state);
    while (state.currentToken !== 1835018 /* CloseBrace */) {
        keys.push(state.tokenValue);
        // Literal = mandatory colon
        if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
            nextToken(state);
            consume(state, 1572879 /* Colon */);
            values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
        }
        else if (state.currentToken & 3072 /* IdentifierName */) {
            // IdentifierName = optional colon
            const { currentChar, currentToken, index } = state;
            nextToken(state);
            if (consumeOpt(state, 1572879 /* Colon */)) {
                values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            }
            else {
                // Shorthand
                state.currentChar = currentChar;
                state.currentToken = currentToken;
                state.index = index;
                values.push(parse(state, 0 /* Reset */, 450 /* Primary */, bindingType & ~512 /* IsIterator */));
            }
        }
        else {
            throw new Error(`Invalid or unsupported property definition in object literal: '${state.input}'`);
        }
        if (state.currentToken !== 1835018 /* CloseBrace */) {
            consume(state, 1572876 /* Comma */);
        }
    }
    consume(state, 1835018 /* CloseBrace */);
    if (bindingType & 512 /* IsIterator */) {
        return new ast_js_1.ObjectBindingPattern(keys, values);
    }
    else {
        state.assignable = false;
        return new ast_js_1.ObjectLiteralExpression(keys, values);
    }
}
function parseInterpolation(state) {
    const parts = [];
    const expressions = [];
    const length = state.length;
    let result = '';
    while (state.index < length) {
        switch (state.currentChar) {
            case 36 /* Dollar */:
                if (state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                    parts.push(result);
                    result = '';
                    state.index += 2;
                    state.currentChar = state.input.charCodeAt(state.index);
                    nextToken(state);
                    const expression = parse(state, 0 /* Reset */, 61 /* Variadic */, 2048 /* Interpolation */);
                    expressions.push(expression);
                    continue;
                }
                else {
                    result += '$';
                }
                break;
            case 92 /* Backslash */:
                result += String.fromCharCode(unescapeCode(nextChar(state)));
                break;
            default:
                result += String.fromCharCode(state.currentChar);
        }
        nextChar(state);
    }
    if (expressions.length) {
        parts.push(result);
        return new ast_js_1.Interpolation(parts, expressions);
    }
    return null;
}
/**
 * parseTemplateLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * TemplateExpression :
 * NoSubstitutionTemplate
 * TemplateHead
 *
 * NoSubstitutionTemplate :
 * ` TemplateCharacters(opt) `
 *
 * TemplateHead :
 * ` TemplateCharacters(opt) ${
 *
 * TemplateSubstitutionTail :
 * TemplateMiddle
 * TemplateTail
 *
 * TemplateMiddle :
 * } TemplateCharacters(opt) ${
 *
 * TemplateTail :
 * } TemplateCharacters(opt) `
 *
 * TemplateCharacters :
 * TemplateCharacter TemplateCharacters(opt)
 *
 * TemplateCharacter :
 * $ [lookahead ≠ {]
 * \ EscapeSequence
 * SourceCharacter (but not one of ` or \ or $)
 */
function parseTemplate(state, access, bindingType, result, tagged) {
    const cooked = [state.tokenValue];
    // TODO: properly implement raw parts / decide whether we want this
    consume(state, 540715 /* TemplateContinuation */);
    const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
    while ((state.currentToken = scanTemplateTail(state)) !== 540714 /* TemplateTail */) {
        cooked.push(state.tokenValue);
        consume(state, 540715 /* TemplateContinuation */);
        expressions.push(parse(state, access, 62 /* Assign */, bindingType));
    }
    cooked.push(state.tokenValue);
    state.assignable = false;
    if (tagged) {
        nextToken(state);
        return new ast_js_1.TaggedTemplateExpression(cooked, cooked, result, expressions);
    }
    else {
        nextToken(state);
        return new ast_js_1.TemplateExpression(cooked, expressions);
    }
}
function nextToken(state) {
    while (state.index < state.length) {
        state.startIndex = state.index;
        if ((state.currentToken = (CharScanners[state.currentChar](state))) != null) { // a null token means the character must be skipped
            return;
        }
    }
    state.currentToken = 1572864 /* EOF */;
}
function nextChar(state) {
    return state.currentChar = state.input.charCodeAt(++state.index);
}
function scanIdentifier(state) {
    // run to the next non-idPart
    while (IdParts[nextChar(state)])
        ;
    const token = KeywordLookup[state.tokenValue = state.tokenRaw];
    return token === undefined ? 1024 /* Identifier */ : token;
}
function scanNumber(state, isFloat) {
    let char = state.currentChar;
    if (isFloat === false) {
        do {
            char = nextChar(state);
        } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
        if (char !== 46 /* Dot */) {
            state.tokenValue = parseInt(state.tokenRaw, 10);
            return 8192 /* NumericLiteral */;
        }
        // past this point it's always a float
        char = nextChar(state);
        if (state.index >= state.length) {
            // unless the number ends with a dot - that behaves a little different in native ES expressions
            // but in our AST that behavior has no effect because numbers are always stored in variables
            state.tokenValue = parseInt(state.tokenRaw.slice(0, -1), 10);
            return 8192 /* NumericLiteral */;
        }
    }
    if (char <= 57 /* Nine */ && char >= 48 /* Zero */) {
        do {
            char = nextChar(state);
        } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
    }
    else {
        state.currentChar = state.input.charCodeAt(--state.index);
    }
    state.tokenValue = parseFloat(state.tokenRaw);
    return 8192 /* NumericLiteral */;
}
function scanString(state) {
    const quote = state.currentChar;
    nextChar(state); // Skip initial quote.
    let unescaped = 0;
    const buffer = new Array();
    let marker = state.index;
    while (state.currentChar !== quote) {
        if (state.currentChar === 92 /* Backslash */) {
            buffer.push(state.input.slice(marker, state.index));
            nextChar(state);
            unescaped = unescapeCode(state.currentChar);
            nextChar(state);
            buffer.push(String.fromCharCode(unescaped));
            marker = state.index;
        }
        else if (state.index >= state.length) {
            throw new Error(`Unterminated quote in string literal: '${state.input}'`);
        }
        else {
            nextChar(state);
        }
    }
    const last = state.input.slice(marker, state.index);
    nextChar(state); // Skip terminating quote.
    // Compute the unescaped string value.
    buffer.push(last);
    const unescapedStr = buffer.join('');
    state.tokenValue = unescapedStr;
    return 4096 /* StringLiteral */;
}
function scanTemplate(state) {
    let tail = true;
    let result = '';
    while (nextChar(state) !== 96 /* Backtick */) {
        if (state.currentChar === 36 /* Dollar */) {
            if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                state.index++;
                tail = false;
                break;
            }
            else {
                result += '$';
            }
        }
        else if (state.currentChar === 92 /* Backslash */) {
            result += String.fromCharCode(unescapeCode(nextChar(state)));
        }
        else {
            if (state.index >= state.length) {
                throw new Error(`Unterminated template string: '${state.input}'`);
            }
            result += String.fromCharCode(state.currentChar);
        }
    }
    nextChar(state);
    state.tokenValue = result;
    if (tail) {
        return 540714 /* TemplateTail */;
    }
    return 540715 /* TemplateContinuation */;
}
function scanTemplateTail(state) {
    if (state.index >= state.length) {
        throw new Error(`Unterminated template string: '${state.input}'`);
    }
    state.index--;
    return scanTemplate(state);
}
function consumeOpt(state, token) {
    if (state.currentToken === token) {
        nextToken(state);
        return true;
    }
    return false;
}
function consume(state, token) {
    if (state.currentToken === token) {
        nextToken(state);
    }
    else {
        throw new Error(`Missing expected token: '${state.input}'`);
    }
}
/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
    $false, $true, $null, $undefined, '$this', '$host', '$parent',
    '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
    '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
    '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
    540714 /* TemplateTail */, 540715 /* TemplateContinuation */,
    'of'
];
const KeywordLookup = Object.create(null);
KeywordLookup.true = 2049 /* TrueKeyword */;
KeywordLookup.null = 2050 /* NullKeyword */;
KeywordLookup.false = 2048 /* FalseKeyword */;
KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
KeywordLookup.$this = 3076 /* ThisScope */;
KeywordLookup.$host = 3077 /* HostScope */;
KeywordLookup.$parent = 3078 /* ParentScope */;
KeywordLookup.in = 1640799 /* InKeyword */;
KeywordLookup.instanceof = 1640800 /* InstanceOfKeyword */;
KeywordLookup.typeof = 34851 /* TypeofKeyword */;
KeywordLookup.void = 34852 /* VoidKeyword */;
KeywordLookup.of = 1051180 /* OfKeyword */;
/**
 * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
 * Single values are denoted by the second value being a 0
 *
 * Copied from output generated with "node build/generate-unicode.js"
 *
 * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
 */
const codes = {
    /* [$0-9A-Za_a-z] */
    AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
    IdStart: /* IdentifierStart */ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
    Digit: /* DecimalNumber */ [0x30, 0x3A],
    Skip: /* Skippable */ [0, 0x21, 0x7F, 0xA1]
};
/**
 * Decompress the ranges into an array of numbers so that the char code
 * can be used as an index to the lookup
 */
function decompress(lookup, $set, compressed, value) {
    const rangeCount = compressed.length;
    for (let i = 0; i < rangeCount; i += 2) {
        const start = compressed[i];
        let end = compressed[i + 1];
        end = end > 0 ? end : start + 1;
        if (lookup) {
            lookup.fill(value, start, end);
        }
        if ($set) {
            for (let ch = start; ch < end; ch++) {
                $set.add(ch);
            }
        }
    }
}
// CharFuncLookup functions
function returnToken(token) {
    return s => {
        nextChar(s);
        return token;
    };
}
const unexpectedCharacter = s => {
    throw new Error(`Unexpected character: '${s.input}'`);
};
unexpectedCharacter.notMapped = true;
// ASCII IdentifierPart lookup
const AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.IdStart, 1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.Digit, 1);
// Character scanning function lookup
const CharScanners = new Array(0xFFFF);
CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
decompress(CharScanners, null, codes.Skip, s => {
    nextChar(s);
    return null;
});
decompress(CharScanners, null, codes.IdStart, scanIdentifier);
decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));
CharScanners[34 /* DoubleQuote */] =
    CharScanners[39 /* SingleQuote */] = s => {
        return scanString(s);
    };
CharScanners[96 /* Backtick */] = s => {
    return scanTemplate(s);
};
// !, !=, !==
CharScanners[33 /* Exclamation */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 32809 /* Exclamation */;
    }
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638680 /* ExclamationEquals */;
    }
    nextChar(s);
    return 1638682 /* ExclamationEqualsEquals */;
};
// =, ==, ===
CharScanners[61 /* Equals */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1048616 /* Equals */;
    }
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638679 /* EqualsEquals */;
    }
    nextChar(s);
    return 1638681 /* EqualsEqualsEquals */;
};
// &, &&
CharScanners[38 /* Ampersand */] = s => {
    if (nextChar(s) !== 38 /* Ampersand */) {
        return 1572883 /* Ampersand */;
    }
    nextChar(s);
    return 1638614 /* AmpersandAmpersand */;
};
// |, ||
CharScanners[124 /* Bar */] = s => {
    if (nextChar(s) !== 124 /* Bar */) {
        return 1572884 /* Bar */;
    }
    nextChar(s);
    return 1638549 /* BarBar */;
};
// .
CharScanners[46 /* Dot */] = s => {
    if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
        return scanNumber(s, true);
    }
    return 16393 /* Dot */;
};
// <, <=
CharScanners[60 /* LessThan */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638747 /* LessThan */;
    }
    nextChar(s);
    return 1638749 /* LessThanEquals */;
};
// >, >=
CharScanners[62 /* GreaterThan */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638748 /* GreaterThan */;
    }
    nextChar(s);
    return 1638750 /* GreaterThanEquals */;
};
CharScanners[37 /* Percent */] = returnToken(1638886 /* Percent */);
CharScanners[40 /* OpenParen */] = returnToken(671751 /* OpenParen */);
CharScanners[41 /* CloseParen */] = returnToken(1835019 /* CloseParen */);
CharScanners[42 /* Asterisk */] = returnToken(1638885 /* Asterisk */);
CharScanners[43 /* Plus */] = returnToken(623009 /* Plus */);
CharScanners[44 /* Comma */] = returnToken(1572876 /* Comma */);
CharScanners[45 /* Minus */] = returnToken(623010 /* Minus */);
CharScanners[47 /* Slash */] = returnToken(1638887 /* Slash */);
CharScanners[58 /* Colon */] = returnToken(1572879 /* Colon */);
CharScanners[63 /* Question */] = returnToken(1572880 /* Question */);
CharScanners[91 /* OpenBracket */] = returnToken(671757 /* OpenBracket */);
CharScanners[93 /* CloseBracket */] = returnToken(1835022 /* CloseBracket */);
CharScanners[123 /* OpenBrace */] = returnToken(131080 /* OpenBrace */);
CharScanners[125 /* CloseBrace */] = returnToken(1835018 /* CloseBrace */);
//# sourceMappingURL=expression-parser.js.map