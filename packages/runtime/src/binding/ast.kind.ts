// a record of the old Expression kind definition
// there's no longer a need for it, though keep it just for good memory purpose
// A thanks, and a token of appreciation to Fred
// for his hard work during the early days of the expression parser, which underpins Aurelia
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const enum ExpressionKind {
  CallsFunction                 = 0b0000000000100_00000, // Calls a function (CallFunction, CallScope, CallMember, TaggedTemplate) -> needs a valid function object returning from its lefthandside's evaluate()
  HasAncestor                   = 0b0000000001000_00000, // Has an "ancestor" property, meaning the expression could climb up the context (only AccessThis, AccessScope and CallScope)
  IsPrimary                     = 0b0000000010000_00000, // Is a primary expression according to ES parsing rules
  IsLeftHandSide                = 0b0000000100000_00000, // Is a left-hand side expression according to ES parsing rules, includes IsPrimary
  HasBind                       = 0b0000001000000_00000, // Has a bind() method (currently only BindingBehavior)
  HasUnbind                     = 0b0000010000000_00000, // Has an unbind() method (currentl only BindingBehavior and ValueConverter)
  IsAssignable                  = 0b0000100000000_00000, // Is an assignable expression according to ES parsing rules (only AccessScope, AccessMember, AccessKeyed ans Assign)
  IsLiteral                     = 0b0001000000000_00000, // Is literal expression (Primitive, Array, Object or Template)
  IsResource                    = 0b0010000000000_00000, // Is an Aurelia resource (ValueConverter or BindingBehavior)
  IsForDeclaration              = 0b0100000000000_00000, // Is a For declaration (for..of, for..in -> currently only ForOfStatement)
  Type                          = 0b0000000000000_11111, // Type mask to uniquely identify each AST class (concrete types start below)
  // ---------------------------------------------------------------------------------------------------------------------------
  AccessThis                    = 0b0000000111000_00001, //               HasAncestor
  AccessScope                   = 0b0000100111011_00010, // IsAssignable  HasAncestor
  ArrayLiteral                  = 0b0001000110001_00011, //
  ObjectLiteral                 = 0b0001000110001_00100, //
  PrimitiveLiteral              = 0b0001000110000_00101, //
  Template                      = 0b0001000110001_00110, //
  Unary                         = 0b0000000000001_00111, //
  CallScope                     = 0b0000000101101_01000, //               HasAncestor  CallsFunction
  CallMember                    = 0b0000000100100_01001, //                            CallsFunction
  CallFunction                  = 0b0000000100100_01010, //                            CallsFunction
  AccessMember                  = 0b0000100100011_01011, // IsAssignable
  AccessKeyed                   = 0b0000100100011_01100, // IsAssignable
  TaggedTemplate                = 0b0000000100101_01101, //                            CallsFunction
  Binary                        = 0b0000000000001_01110, //
  Conditional                   = 0b0000000000001_11111, //
  Assign                        = 0b0000100000000_10000, // IsAssignable
  ArrowFunction                 = 0b0000000000000_10001, //
  ValueConverter                = 0b0010010000001_10010, //
  BindingBehavior               = 0b0010011000001_10011, //
  HtmlLiteral                   = 0b0000000000001_10100, //
  ArrayBindingPattern           = 0b0100000000000_10101, //
  ObjectBindingPattern          = 0b0100000000000_10110, //
  BindingIdentifier             = 0b0100000000000_10111, //
  ForOfStatement                = 0b0000011000001_11000, //
  Interpolation                 = 0b0000000000000_11001, //
  ArrayDestructuring            = 0b0101100000000_11010, // IsAssignable
  ObjectDestructuring           = 0b0110100000000_11011, // IsAssignable
  DestructuringAssignmentLeaf   = 0b1000100000000_11100, // IsAssignable
}
