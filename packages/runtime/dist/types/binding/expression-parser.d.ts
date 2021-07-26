import { ForOfStatement, Interpolation, AnyBindingExpression, IsAssign, IsBinary, IsBindingBehavior, IsConditional, IsLeftHandSide, IsPrimary, IsUnary } from './ast.js';
export interface IExpressionParser extends ExpressionParser {
}
export declare const IExpressionParser: import("@aurelia/kernel").InterfaceSymbol<IExpressionParser>;
export declare class ExpressionParser {
    private readonly expressionLookup;
    private readonly forOfLookup;
    private readonly interpolationLookup;
    parse(expression: string, bindingType: BindingType.ForCommand): ForOfStatement;
    parse(expression: string, bindingType: BindingType.Interpolation): Interpolation;
    parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
    parse(expression: string, bindingType: BindingType): AnyBindingExpression;
    private $parse;
}
export declare const enum Char {
    Null = 0,
    Backspace = 8,
    Tab = 9,
    LineFeed = 10,
    VerticalTab = 11,
    FormFeed = 12,
    CarriageReturn = 13,
    Space = 32,
    Exclamation = 33,
    DoubleQuote = 34,
    Dollar = 36,
    Percent = 37,
    Ampersand = 38,
    SingleQuote = 39,
    OpenParen = 40,
    CloseParen = 41,
    Asterisk = 42,
    Plus = 43,
    Comma = 44,
    Minus = 45,
    Dot = 46,
    Slash = 47,
    Semicolon = 59,
    Backtick = 96,
    OpenBracket = 91,
    Backslash = 92,
    CloseBracket = 93,
    Caret = 94,
    Underscore = 95,
    OpenBrace = 123,
    Bar = 124,
    CloseBrace = 125,
    Colon = 58,
    LessThan = 60,
    Equals = 61,
    GreaterThan = 62,
    Question = 63,
    Zero = 48,
    One = 49,
    Two = 50,
    Three = 51,
    Four = 52,
    Five = 53,
    Six = 54,
    Seven = 55,
    Eight = 56,
    Nine = 57,
    UpperA = 65,
    UpperB = 66,
    UpperC = 67,
    UpperD = 68,
    UpperE = 69,
    UpperF = 70,
    UpperG = 71,
    UpperH = 72,
    UpperI = 73,
    UpperJ = 74,
    UpperK = 75,
    UpperL = 76,
    UpperM = 77,
    UpperN = 78,
    UpperO = 79,
    UpperP = 80,
    UpperQ = 81,
    UpperR = 82,
    UpperS = 83,
    UpperT = 84,
    UpperU = 85,
    UpperV = 86,
    UpperW = 87,
    UpperX = 88,
    UpperY = 89,
    UpperZ = 90,
    LowerA = 97,
    LowerB = 98,
    LowerC = 99,
    LowerD = 100,
    LowerE = 101,
    LowerF = 102,
    LowerG = 103,
    LowerH = 104,
    LowerI = 105,
    LowerJ = 106,
    LowerK = 107,
    LowerL = 108,
    LowerM = 109,
    LowerN = 110,
    LowerO = 111,
    LowerP = 112,
    LowerQ = 113,
    LowerR = 114,
    LowerS = 115,
    LowerT = 116,
    LowerU = 117,
    LowerV = 118,
    LowerW = 119,
    LowerX = 120,
    LowerY = 121,
    LowerZ = 122
}
export declare const enum Access {
    Reset = 0,
    Ancestor = 511,
    This = 512,
    Scope = 1024,
    Member = 2048,
    Keyed = 4096
}
export declare const enum Precedence {
    Variadic = 61,
    Assign = 62,
    Conditional = 63,
    LogicalOR = 64,
    LogicalAND = 128,
    Equality = 192,
    Relational = 256,
    Additive = 320,
    Multiplicative = 384,
    Binary = 448,
    LeftHandSide = 449,
    Primary = 450,
    Unary = 451
}
export declare const enum BindingType {
    None = 0,
    IgnoreAttr = 4096,
    Interpolation = 2048,
    IsRef = 5376,
    IsIterator = 512,
    IsCustom = 256,
    IsFunction = 128,
    IsEvent = 64,
    IsProperty = 32,
    IsCommand = 16,
    IsPropertyCommand = 48,
    IsEventCommand = 80,
    DelegationStrategyDelta = 6,
    Command = 15,
    OneTimeCommand = 49,
    ToViewCommand = 50,
    FromViewCommand = 51,
    TwoWayCommand = 52,
    BindCommand = 53,
    TriggerCommand = 4182,
    CaptureCommand = 4183,
    DelegateCommand = 4184,
    CallCommand = 153,
    OptionsCommand = 26,
    ForCommand = 539,
    CustomCommand = 284
}
export declare class ParserState {
    ip: string;
    index: number;
    length: number;
    constructor(ip: string);
}
export declare function parseExpression<TType extends BindingType = BindingType.BindCommand>(input: string, bindingType?: TType): TType extends BindingType.Interpolation ? Interpolation : TType extends BindingType.ForCommand ? ForOfStatement : IsBindingBehavior;
export declare function parse<TPrec extends Precedence, TType extends BindingType>(state: ParserState, access: Access, minPrecedence: TPrec, bindingType: TType): TPrec extends Precedence.Unary ? IsUnary : TPrec extends Precedence.Binary ? IsBinary : TPrec extends Precedence.LeftHandSide ? IsLeftHandSide : TPrec extends Precedence.Assign ? IsAssign : TPrec extends Precedence.Conditional ? IsConditional : TPrec extends Precedence.Primary ? IsPrimary : TPrec extends Precedence.Multiplicative ? IsBinary : TPrec extends Precedence.Additive ? IsBinary : TPrec extends Precedence.Relational ? IsBinary : TPrec extends Precedence.Equality ? IsBinary : TPrec extends Precedence.LogicalAND ? IsBinary : TPrec extends Precedence.LogicalOR ? IsBinary : TPrec extends Precedence.Variadic ? TType extends BindingType.Interpolation ? Interpolation : TType extends BindingType.ForCommand ? ForOfStatement : never : never;
//# sourceMappingURL=expression-parser.d.ts.map