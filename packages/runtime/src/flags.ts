/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
export enum BindingMode {
  oneTime  = 0b0001,
  toView   = 0b0010,
  fromView = 0b0100,
  twoWay   = 0b0110,
  default  = 0b1000
}

export const enum BindingStrategy {
  /**
   * Configures all components "below" this one to operate in getterSetter binding mode.
   * This is the default; if no strategy is specified, this one is implied.
   *
   * This strategy is the most compatible, convenient and has the best performance on frequently updated bindings on components that are infrequently replaced.
   * However, it also consumes the most resources on initialization.
   */
  getterSetter = 0b01,
  /**
   * Configures all components "below" this one to operate in proxy binding mode.
   * No getters/setters are created.
   *
   * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
   * components that are frequently replaced.
   * However, it consumes more resources on updates.
   */
  proxies      = 0b10,
}

const mandatoryStrategy = BindingStrategy.getterSetter | BindingStrategy.proxies;

export function ensureValidStrategy(strategy: BindingStrategy | null | undefined): BindingStrategy {
  if ((strategy! & mandatoryStrategy) === 0) {
    // TODO: probably want to validate that user isn't trying to mix getterSetter/proxy
    // TODO: also need to make sure that strategy can be changed away from proxies inside the component tree (not here though, but just making a note)
    return strategy! | BindingStrategy.getterSetter;
  }
  return strategy!;
}

export const enum LifecycleFlags {
  none                          = 0b00000_00_00_00_000,
  // Bitmask for flags that need to be stored on a binding during $bind for mutation
  // callbacks outside of $bind
  persistentBindingFlags        = 0b11111_000_00_00_111,
  allowParentScopeTraversal     = 0b00001_000_00_00_000,
  observeLeafPropertiesOnly     = 0b00010_000_00_00_000,
  targetObserverFlags           = 0b01100_000_00_00_111,
  noTargetObserverQueue         = 0b00100_000_00_00_000,
  persistentTargetObserverQueue = 0b01000_000_00_00_000,
  secondaryExpression           = 0b10000_000_00_00_000,
  bindingStrategy               = 0b00000_000_00_00_111,
  getterSetterStrategy          = 0b00000_000_00_00_001,
  proxyStrategy                 = 0b00000_000_00_00_010,
  isStrictBindingStrategy       = 0b00000_000_00_00_100,
  update                        = 0b00000_000_00_11_000,
  updateTargetInstance          = 0b00000_000_00_01_000,
  updateSourceExpression        = 0b00000_000_00_10_000,
  from                          = 0b00000_000_11_00_000,
  fromBind                      = 0b00000_000_01_00_000,
  fromUnbind                    = 0b00000_000_10_00_000,
  mustEvaluate                  = 0b00000_001_00_00_000,
  isTraversingParentScope       = 0b00000_010_00_00_000,
  dispose                       = 0b00000_100_00_00_000,
}

export const enum ExpressionKind {
  Connects             = 0b000000000001_00000, // The expression's connect() function calls observeProperty and/or calls connect() on another expression that it wraps (all expressions except for AccessThis, PrimitiveLiteral, CallMember/Function and Assign)
  Observes             = 0b000000000010_00000, // The expression's connect() function calls observeProperty (only AccessScope, AccessMember and AccessKeyed do this)
  CallsFunction        = 0b000000000100_00000, // Calls a function (CallFunction, CallScope, CallMember, TaggedTemplate) -> needs a valid function object returning from its lefthandside's evaluate()
  HasAncestor          = 0b000000001000_00000, // Has an "ancestor" property, meaning the expression could climb up the context (only AccessThis, AccessScope and CallScope)
  IsPrimary            = 0b000000010000_00000, // Is a primary expression according to ES parsing rules
  IsLeftHandSide       = 0b000000100000_00000, // Is a left-hand side expression according to ES parsing rules, includes IsPrimary
  HasBind              = 0b000001000000_00000, // Has a bind() method (currently only BindingBehavior)
  HasUnbind            = 0b000010000000_00000, // Has an unbind() method (currentl only BindingBehavior and ValueConverter)
  IsAssignable         = 0b000100000000_00000, // Is an assignable expression according to ES parsing rules (only AccessScope, AccessMember, AccessKeyed ans Assign)
  IsLiteral            = 0b001000000000_00000, // Is an Aurelia resource (ValueConverter or BindingBehavior)
  IsResource           = 0b010000000000_00000, // Is literal expression (Primitive, Array, Object or Template)
  IsForDeclaration     = 0b100000000000_00000, // Is a For declaration (for..of, for..in -> currently only ForOfStatement)
  Type                 = 0b000000000000_11111, // Type mask to uniquely identify each AST class (concrete types start below)
  // ---------------------------------------------------------------------------------------------------------------------------
  AccessThis           = 0b000000111000_00001, //               HasAncestor
  AccessScope          = 0b000100111011_00010, // IsAssignable  HasAncestor       Observes  Connects
  ArrayLiteral         = 0b001000110001_00011, //                                           Connects
  ObjectLiteral        = 0b001000110001_00100, //                                           Connects
  PrimitiveLiteral     = 0b001000110000_00101, //
  Template             = 0b001000110001_00110, //                                           Connects
  Unary                = 0b000000000001_00111, //                                           Connects
  CallScope            = 0b000000101101_01000, //               HasAncestor  CallsFunction  Connects
  CallMember           = 0b000000100100_01001, //                            CallsFunction
  CallFunction         = 0b000000100100_01010, //                            CallsFunction
  AccessMember         = 0b000100100011_01011, // IsAssignable                    Observes  Connects
  AccessKeyed          = 0b000100100011_01100, // IsAssignable                    Observes  Connects
  TaggedTemplate       = 0b000000100101_01101, //                            CallsFunction  Connects
  Binary               = 0b000000000001_01110, //                                           Connects
  Conditional          = 0b000000000001_11111, //                                           Connects
  Assign               = 0b000100000000_10000, // IsAssignable
  ValueConverter       = 0b010010000001_10001, //                                           Connects
  BindingBehavior      = 0b010011000001_10010, //                                           Connects
  HtmlLiteral          = 0b000000000001_10011, //                                           Connects
  ArrayBindingPattern  = 0b100000000000_10100, //
  ObjectBindingPattern = 0b100000000000_10101, //
  BindingIdentifier    = 0b100000000000_10110, //
  ForOfStatement       = 0b000011000001_10111, //                                           Connects
  Interpolation        = 0b000000000000_11000  //
}
