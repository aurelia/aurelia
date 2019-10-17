(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const common_1 = require("./common");
    const { enter, leave } = kernel_1.Profiler.createTimer('ExpressionParser');
    const $false = runtime_1.PrimitiveLiteralExpression.$false;
    const $true = runtime_1.PrimitiveLiteralExpression.$true;
    const $null = runtime_1.PrimitiveLiteralExpression.$null;
    const $undefined = runtime_1.PrimitiveLiteralExpression.$undefined;
    const $this = runtime_1.AccessThisExpression.$this;
    const $parent = runtime_1.AccessThisExpression.$parent;
    /** @internal */
    class ParserState {
        constructor(input) {
            this.index = 0;
            this.startIndex = 0;
            this.lastIndex = 0;
            this.input = input;
            this.length = input.length;
            this.currentToken = 1572864 /* EOF */;
            this.tokenValue = '';
            this.currentChar = input.charCodeAt(0);
            this.assignable = true;
        }
        get tokenRaw() {
            return this.input.slice(this.startIndex, this.index);
        }
    }
    exports.ParserState = ParserState;
    const $state = new ParserState('');
    var SyntaxError;
    (function (SyntaxError) {
        SyntaxError[SyntaxError["InvalidExpressionStart"] = 100] = "InvalidExpressionStart";
        SyntaxError[SyntaxError["UnconsumedToken"] = 101] = "UnconsumedToken";
        SyntaxError[SyntaxError["DoubleDot"] = 102] = "DoubleDot";
        SyntaxError[SyntaxError["InvalidMemberExpression"] = 103] = "InvalidMemberExpression";
        SyntaxError[SyntaxError["UnexpectedEndOfExpression"] = 104] = "UnexpectedEndOfExpression";
        SyntaxError[SyntaxError["ExpectedIdentifier"] = 105] = "ExpectedIdentifier";
        SyntaxError[SyntaxError["InvalidForDeclaration"] = 106] = "InvalidForDeclaration";
        SyntaxError[SyntaxError["InvalidObjectLiteralPropertyDefinition"] = 107] = "InvalidObjectLiteralPropertyDefinition";
        SyntaxError[SyntaxError["UnterminatedQuote"] = 108] = "UnterminatedQuote";
        SyntaxError[SyntaxError["UnterminatedTemplate"] = 109] = "UnterminatedTemplate";
        SyntaxError[SyntaxError["MissingExpectedToken"] = 110] = "MissingExpectedToken";
        SyntaxError[SyntaxError["UnexpectedCharacter"] = 111] = "UnexpectedCharacter";
        SyntaxError[SyntaxError["MissingValueConverter"] = 112] = "MissingValueConverter";
        SyntaxError[SyntaxError["MissingBindingBehavior"] = 113] = "MissingBindingBehavior";
    })(SyntaxError || (SyntaxError = {}));
    var SemanticError;
    (function (SemanticError) {
        SemanticError[SemanticError["NotAssignable"] = 150] = "NotAssignable";
        SemanticError[SemanticError["UnexpectedForOf"] = 151] = "UnexpectedForOf";
    })(SemanticError || (SemanticError = {}));
    function parseExpression(input, bindingType) {
        $state.input = input;
        $state.length = input.length;
        $state.index = 0;
        $state.currentChar = input.charCodeAt(0);
        return parse($state, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
    }
    exports.parseExpression = parseExpression;
    /** @internal */
    // JUSTIFICATION: This is performance-critical code which follows a subset of the well-known ES spec.
    // Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
    // single source of information for being able to figure it out.
    // It generally does not need to change unless the spec changes or spec violations are found, or optimization
    // opportunities are found (which would likely not fix these warnings in any case).
    // It's therefore not considered to have any tangible impact on the maintainability of the code base.
    // For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
    // eslint-disable-next-line max-lines-per-function
    function parse(state, access, minPrecedence, bindingType) {
        if (bindingType === 284 /* CustomCommand */) {
            return new runtime_1.CustomExpression(state.input);
        }
        if (state.index === 0) {
            if (bindingType & 2048 /* Interpolation */) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return parseInterpolation(state);
            }
            nextToken(state);
            if (state.currentToken & 1048576 /* ExpressionTerminal */) {
                throw kernel_1.Reporter.error(100 /* InvalidExpressionStart */, { state });
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
            result = new runtime_1.UnaryExpression(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
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
                case 3077 /* ParentScope */: // $parent
                    state.assignable = false;
                    do {
                        nextToken(state);
                        access++; // ancestor
                        if (consumeOpt(state, 16392 /* Dot */)) {
                            if (state.currentToken === 16392 /* Dot */) {
                                throw kernel_1.Reporter.error(102 /* DoubleDot */, { state });
                            }
                            else if (state.currentToken === 1572864 /* EOF */) {
                                throw kernel_1.Reporter.error(105 /* ExpectedIdentifier */, { state });
                            }
                        }
                        else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                            const ancestor = access & 511 /* Ancestor */;
                            result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new runtime_1.AccessThisExpression(ancestor);
                            access = 512 /* This */;
                            break primary;
                        }
                        else {
                            throw kernel_1.Reporter.error(103 /* InvalidMemberExpression */, { state });
                        }
                    } while (state.currentToken === 3077 /* ParentScope */);
                // falls through
                case 1024 /* Identifier */: // identifier
                    if (bindingType & 512 /* IsIterator */) {
                        result = new runtime_1.BindingIdentifier(state.tokenValue);
                    }
                    else {
                        result = new runtime_1.AccessScopeExpression(state.tokenValue, access & 511 /* Ancestor */);
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
                case 671750 /* OpenParen */: // parenthesized expression
                    nextToken(state);
                    result = parse(state, 0 /* Reset */, 62 /* Assign */, bindingType);
                    consume(state, 1835018 /* CloseParen */);
                    access = 0 /* Reset */;
                    break;
                case 671756 /* OpenBracket */:
                    result = parseArrayLiteralExpression(state, access, bindingType);
                    access = 0 /* Reset */;
                    break;
                case 131079 /* OpenBrace */:
                    result = parseObjectLiteralExpression(state, bindingType);
                    access = 0 /* Reset */;
                    break;
                case 540713 /* TemplateTail */:
                    result = new runtime_1.TemplateExpression([state.tokenValue]);
                    state.assignable = false;
                    nextToken(state);
                    access = 0 /* Reset */;
                    break;
                case 540714 /* TemplateContinuation */:
                    result = parseTemplate(state, access, bindingType, result, false);
                    access = 0 /* Reset */;
                    break;
                case 4096 /* StringLiteral */:
                case 8192 /* NumericLiteral */:
                    result = new runtime_1.PrimitiveLiteralExpression(state.tokenValue);
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
                        throw kernel_1.Reporter.error(104 /* UnexpectedEndOfExpression */, { state });
                    }
                    else {
                        throw kernel_1.Reporter.error(101 /* UnconsumedToken */, { state });
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
                    case 16392 /* Dot */:
                        state.assignable = true;
                        nextToken(state);
                        if ((state.currentToken & 3072 /* IdentifierName */) === 0) {
                            throw kernel_1.Reporter.error(105 /* ExpectedIdentifier */, { state });
                        }
                        name = state.tokenValue;
                        nextToken(state);
                        // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                        access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                        if (state.currentToken === 671750 /* OpenParen */) {
                            if (access === 0 /* Reset */) { // if the left hand side is a literal, make sure we parse a CallMemberExpression
                                access = 2048 /* Member */;
                            }
                            continue;
                        }
                        if (access & 1024 /* Scope */) {
                            result = new runtime_1.AccessScopeExpression(name, result.ancestor);
                        }
                        else { // if it's not $Scope, it's $Member
                            result = new runtime_1.AccessMemberExpression(result, name);
                        }
                        continue;
                    case 671756 /* OpenBracket */:
                        state.assignable = true;
                        nextToken(state);
                        access = 4096 /* Keyed */;
                        result = new runtime_1.AccessKeyedExpression(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                        consume(state, 1835021 /* CloseBracket */);
                        break;
                    case 671750 /* OpenParen */:
                        state.assignable = false;
                        nextToken(state);
                        while (state.currentToken !== 1835018 /* CloseParen */) {
                            args.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                            if (!consumeOpt(state, 1572875 /* Comma */)) {
                                break;
                            }
                        }
                        consume(state, 1835018 /* CloseParen */);
                        if (access & 1024 /* Scope */) {
                            result = new runtime_1.CallScopeExpression(name, args, result.ancestor);
                        }
                        else if (access & 2048 /* Member */) {
                            result = new runtime_1.CallMemberExpression(result, name, args);
                        }
                        else {
                            result = new runtime_1.CallFunctionExpression(result, args);
                        }
                        access = 0;
                        break;
                    case 540713 /* TemplateTail */:
                        state.assignable = false;
                        strings = [state.tokenValue];
                        result = new runtime_1.TaggedTemplateExpression(strings, strings, result);
                        nextToken(state);
                        break;
                    case 540714 /* TemplateContinuation */:
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
            result = new runtime_1.BinaryExpression(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
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
        if (consumeOpt(state, 1572879 /* Question */)) {
            const yes = parse(state, access, 62 /* Assign */, bindingType);
            consume(state, 1572878 /* Colon */);
            result = new runtime_1.ConditionalExpression(result, yes, parse(state, access, 62 /* Assign */, bindingType));
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
        if (consumeOpt(state, 1048615 /* Equals */)) {
            if (!state.assignable) {
                throw kernel_1.Reporter.error(150 /* NotAssignable */, { state });
            }
            result = new runtime_1.AssignExpression(result, parse(state, access, 62 /* Assign */, bindingType));
        }
        if (61 /* Variadic */ < minPrecedence) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        /** parseValueConverter
         */
        while (consumeOpt(state, 1572883 /* Bar */)) {
            if (state.currentToken === 1572864 /* EOF */) {
                throw kernel_1.Reporter.error(112);
            }
            const name = state.tokenValue;
            nextToken(state);
            const args = new Array();
            while (consumeOpt(state, 1572878 /* Colon */)) {
                args.push(parse(state, access, 62 /* Assign */, bindingType));
            }
            result = new runtime_1.ValueConverterExpression(result, name, args);
        }
        /** parseBindingBehavior
         */
        while (consumeOpt(state, 1572880 /* Ampersand */)) {
            if (state.currentToken === 1572864 /* EOF */) {
                throw kernel_1.Reporter.error(113);
            }
            const name = state.tokenValue;
            nextToken(state);
            const args = new Array();
            while (consumeOpt(state, 1572878 /* Colon */)) {
                args.push(parse(state, access, 62 /* Assign */, bindingType));
            }
            result = new runtime_1.BindingBehaviorExpression(result, name, args);
        }
        if (state.currentToken !== 1572864 /* EOF */) {
            if (bindingType & 2048 /* Interpolation */) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return result;
            }
            if (state.tokenRaw === 'of') {
                throw kernel_1.Reporter.error(151 /* UnexpectedForOf */, { state });
            }
            throw kernel_1.Reporter.error(101 /* UnconsumedToken */, { state });
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
        while (state.currentToken !== 1835021 /* CloseBracket */) {
            if (consumeOpt(state, 1572875 /* Comma */)) {
                elements.push($undefined);
                if (state.currentToken === 1835021 /* CloseBracket */) {
                    break;
                }
            }
            else {
                elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
                if (consumeOpt(state, 1572875 /* Comma */)) {
                    if (state.currentToken === 1835021 /* CloseBracket */) {
                        break;
                    }
                }
                else {
                    break;
                }
            }
        }
        consume(state, 1835021 /* CloseBracket */);
        if (bindingType & 512 /* IsIterator */) {
            return new runtime_1.ArrayBindingPattern(elements);
        }
        else {
            state.assignable = false;
            return new runtime_1.ArrayLiteralExpression(elements);
        }
    }
    function parseForOfStatement(state, result) {
        if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
            throw kernel_1.Reporter.error(106 /* InvalidForDeclaration */, { state });
        }
        if (state.currentToken !== 1051179 /* OfKeyword */) {
            throw kernel_1.Reporter.error(106 /* InvalidForDeclaration */, { state });
        }
        nextToken(state);
        const declaration = result;
        const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
        return new runtime_1.ForOfStatement(declaration, statement);
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
        while (state.currentToken !== 1835017 /* CloseBrace */) {
            keys.push(state.tokenValue);
            // Literal = mandatory colon
            if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
                nextToken(state);
                consume(state, 1572878 /* Colon */);
                values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            }
            else if (state.currentToken & 3072 /* IdentifierName */) {
                // IdentifierName = optional colon
                const { currentChar, currentToken, index } = state;
                nextToken(state);
                if (consumeOpt(state, 1572878 /* Colon */)) {
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
                throw kernel_1.Reporter.error(107 /* InvalidObjectLiteralPropertyDefinition */, { state });
            }
            if (state.currentToken !== 1835017 /* CloseBrace */) {
                consume(state, 1572875 /* Comma */);
            }
        }
        consume(state, 1835017 /* CloseBrace */);
        if (bindingType & 512 /* IsIterator */) {
            return new runtime_1.ObjectBindingPattern(keys, values);
        }
        else {
            state.assignable = false;
            return new runtime_1.ObjectLiteralExpression(keys, values);
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
                    result += String.fromCharCode(common_1.unescapeCode(nextChar(state)));
                    break;
                default:
                    result += String.fromCharCode(state.currentChar);
            }
            nextChar(state);
        }
        if (expressions.length) {
            parts.push(result);
            return new runtime_1.Interpolation(parts, expressions);
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
        consume(state, 540714 /* TemplateContinuation */);
        const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
        while ((state.currentToken = scanTemplateTail(state)) !== 540713 /* TemplateTail */) {
            cooked.push(state.tokenValue);
            consume(state, 540714 /* TemplateContinuation */);
            expressions.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        cooked.push(state.tokenValue);
        state.assignable = false;
        if (tagged) {
            nextToken(state);
            return new runtime_1.TaggedTemplateExpression(cooked, cooked, result, expressions);
        }
        else {
            nextToken(state);
            return new runtime_1.TemplateExpression(cooked, expressions);
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
                unescaped = common_1.unescapeCode(state.currentChar);
                nextChar(state);
                buffer.push(String.fromCharCode(unescaped));
                marker = state.index;
            }
            else if (state.index >= state.length) {
                throw kernel_1.Reporter.error(108 /* UnterminatedQuote */, { state });
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
                result += String.fromCharCode(common_1.unescapeCode(nextChar(state)));
            }
            else {
                if (state.index >= state.length) {
                    throw kernel_1.Reporter.error(109 /* UnterminatedTemplate */, { state });
                }
                result += String.fromCharCode(state.currentChar);
            }
        }
        nextChar(state);
        state.tokenValue = result;
        if (tail) {
            return 540713 /* TemplateTail */;
        }
        return 540714 /* TemplateContinuation */;
    }
    function scanTemplateTail(state) {
        if (state.index >= state.length) {
            throw kernel_1.Reporter.error(109 /* UnterminatedTemplate */, { state });
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
            throw kernel_1.Reporter.error(110 /* MissingExpectedToken */, { state, expected: token });
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
        $false, $true, $null, $undefined, '$this', '$parent',
        '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
        '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
        '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
        540713 /* TemplateTail */, 540714 /* TemplateContinuation */,
        'of'
    ];
    const KeywordLookup = Object.create(null);
    KeywordLookup.true = 2049 /* TrueKeyword */;
    KeywordLookup.null = 2050 /* NullKeyword */;
    KeywordLookup.false = 2048 /* FalseKeyword */;
    KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
    KeywordLookup.$this = 3076 /* ThisScope */;
    KeywordLookup.$parent = 3077 /* ParentScope */;
    KeywordLookup.in = 1640798 /* InKeyword */;
    KeywordLookup.instanceof = 1640799 /* InstanceOfKeyword */;
    KeywordLookup.typeof = 34850 /* TypeofKeyword */;
    KeywordLookup.void = 34851 /* VoidKeyword */;
    KeywordLookup.of = 1051179 /* OfKeyword */;
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
        throw kernel_1.Reporter.error(111 /* UnexpectedCharacter */, { state: s });
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
            return 32808 /* Exclamation */;
        }
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638679 /* ExclamationEquals */;
        }
        nextChar(s);
        return 1638681 /* ExclamationEqualsEquals */;
    };
    // =, ==, ===
    CharScanners[61 /* Equals */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 1048615 /* Equals */;
        }
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638678 /* EqualsEquals */;
        }
        nextChar(s);
        return 1638680 /* EqualsEqualsEquals */;
    };
    // &, &&
    CharScanners[38 /* Ampersand */] = s => {
        if (nextChar(s) !== 38 /* Ampersand */) {
            return 1572880 /* Ampersand */;
        }
        nextChar(s);
        return 1638613 /* AmpersandAmpersand */;
    };
    // |, ||
    CharScanners[124 /* Bar */] = s => {
        if (nextChar(s) !== 124 /* Bar */) {
            return 1572883 /* Bar */;
        }
        nextChar(s);
        return 1638548 /* BarBar */;
    };
    // .
    CharScanners[46 /* Dot */] = s => {
        if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
            return scanNumber(s, true);
        }
        return 16392 /* Dot */;
    };
    // <, <=
    CharScanners[60 /* LessThan */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638746 /* LessThan */;
        }
        nextChar(s);
        return 1638748 /* LessThanEquals */;
    };
    // >, >=
    CharScanners[62 /* GreaterThan */] = s => {
        if (nextChar(s) !== 61 /* Equals */) {
            return 1638747 /* GreaterThan */;
        }
        nextChar(s);
        return 1638749 /* GreaterThanEquals */;
    };
    CharScanners[37 /* Percent */] = returnToken(1638885 /* Percent */);
    CharScanners[40 /* OpenParen */] = returnToken(671750 /* OpenParen */);
    CharScanners[41 /* CloseParen */] = returnToken(1835018 /* CloseParen */);
    CharScanners[42 /* Asterisk */] = returnToken(1638884 /* Asterisk */);
    CharScanners[43 /* Plus */] = returnToken(623008 /* Plus */);
    CharScanners[44 /* Comma */] = returnToken(1572875 /* Comma */);
    CharScanners[45 /* Minus */] = returnToken(623009 /* Minus */);
    CharScanners[47 /* Slash */] = returnToken(1638886 /* Slash */);
    CharScanners[58 /* Colon */] = returnToken(1572878 /* Colon */);
    CharScanners[63 /* Question */] = returnToken(1572879 /* Question */);
    CharScanners[91 /* OpenBracket */] = returnToken(671756 /* OpenBracket */);
    CharScanners[93 /* CloseBracket */] = returnToken(1835021 /* CloseBracket */);
    CharScanners[123 /* OpenBrace */] = returnToken(131079 /* OpenBrace */);
    CharScanners[125 /* CloseBrace */] = returnToken(1835017 /* CloseBrace */);
});
//# sourceMappingURL=expression-parser.js.map