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

export const enum State {
  none                  = 0b000_000000_00_000000_00000000,
  isBinding             = 0b000_000000_00_000000_00000001,
  isUnbinding           = 0b000000_00_000000_00000010,
  isBound               = 0b000000_00_000000_00000100,
  isBoundOrBinding      = 0b000000_00_000000_00000101,
  isBoundOrUnbinding    = 0b000000_00_000000_00000110,
  isAttaching           = 0b000000_00_000000_00001000,
  isDetaching           = 0b000000_00_000000_00010000,
  isAttached            = 0b000000_00_000000_00100000,
  isAttachedOrAttaching = 0b000000_00_000000_00101000,
  isAttachedOrDetaching = 0b000000_00_000000_00110000,
  isMounted             = 0b000000_00_000000_01000000,
  isCached              = 0b000000_00_000000_10000000,
  needsBind             = 0b000000_00_000001_00000000,
  needsUnbind           = 0b000000_00_000010_00000000,
  needsAttach           = 0b000000_00_000100_00000000,
  needsDetach           = 0b000000_00_001000_00000000,
  needsMount            = 0b000000_00_010000_00000000,
  needsUnmount          = 0b000000_00_100000_00000000,
  hasLockedScope        = 0b000000_01_000000_00000000,
  canBeCached           = 0b000000_10_000000_00000000,
  inBoundQueue          = 0b000001_00_000000_00000000,
  inUnboundQueue        = 0b000010_00_000000_00000000,
  inAttachedQueue       = 0b000100_00_000000_00000000,
  inDetachedQueue       = 0b001000_00_000000_00000000,
  inMountQueue          = 0b010000_00_000000_00000000,
  inUnmountQueue        = 0b100000_00_000000_00000000,

}

export const enum Hooks {
  none                   = 0b000000000001,
  hasCreated             = 0b000000000010,
  hasBinding             = 0b000000000100,
  hasBound               = 0b000000001000,
  hasAttaching           = 0b000000010000,
  hasAttached            = 0b000000100000,
  hasDetaching           = 0b000001000000,
  hasDetached            = 0b000010000000,
  hasUnbinding           = 0b000100000000,
  hasUnbound             = 0b001000000000,
  hasRender              = 0b010000000000,
  hasCaching             = 0b100000000000
}

export const enum LifecycleFlags {
  none                          = 0b00000_0000000_0000000000000_00_0000,
  // Bitmask for flags that need to be stored on a binding during $bind for mutation
  // callbacks outside of $bind
  persistentBindingFlags        = 0b11111_0000000_0000000000000_00_1111,
  allowParentScopeTraversal     = 0b00001_0000000_0000000000000_00_0000,
  observeLeafPropertiesOnly     = 0b00010_0000000_0000000000000_00_0000,
  targetObserverFlags           = 0b01100_0000000_0000000000000_00_1111,
  noTargetObserverQueue         = 0b00100_0000000_0000000000000_00_0000,
  persistentTargetObserverQueue = 0b01000_0000000_0000000000000_00_0000,
  secondaryExpression           = 0b10000_0000000_0000000000000_00_0000,
  bindingStrategy               = 0b00000_0000000_0000000000000_00_1111,
  getterSetterStrategy          = 0b00000_0000000_0000000000000_00_0001,
  proxyStrategy                 = 0b00000_0000000_0000000000000_00_0010,
  isStrictBindingStrategy       = 0b00000_0000000_0000000000000_00_0100,
  update                        = 0b00000_0000000_0000000000000_11_0000,
  updateTargetInstance          = 0b00000_0000000_0000000000000_01_0000,
  updateSourceExpression        = 0b00000_0000000_0000000000000_10_0000,
  from                          = 0b00000_0000000_1111111111111_00_0000,
  fromFlush                     = 0b00000_0000000_0000000001111_00_0000,
  fromAsyncFlush                = 0b00000_0000000_0000000000001_00_0000,
  fromSyncFlush                 = 0b00000_0000000_0000000000010_00_0000,
  fromTick                      = 0b00000_0000000_0000000000100_00_0000,
  fromBatch                     = 0b00000_0000000_0000000001000_00_0000,
  fromStartTask                 = 0b00000_0000000_0000000010000_00_0000,
  fromStopTask                  = 0b00000_0000000_0000000100000_00_0000,
  fromBind                      = 0b00000_0000000_0000001000000_00_0000,
  fromUnbind                    = 0b00000_0000000_0000010000000_00_0000,
  fromAttach                    = 0b00000_0000000_0000100000000_00_0000,
  fromDetach                    = 0b00000_0000000_0001000000000_00_0000,
  fromCache                     = 0b00000_0000000_0010000000000_00_0000,
  fromDOMEvent                  = 0b00000_0000000_0100000000000_00_0000,
  fromLifecycleTask             = 0b00000_0000000_1000000000000_00_0000,
  allowPublishRoundtrip         = 0b00000_0000001_0000000000000_00_0000,
  isPublishing                  = 0b00000_0000010_0000000000000_00_0000,
  mustEvaluate                  = 0b00000_0000100_0000000000000_00_0000,
  isTraversingParentScope       = 0b00000_0001000_0000000000000_00_0000,
  isOriginalArray               = 0b00000_0010000_0000000000000_00_0000,
  isCollectionMutation          = 0b00000_0100000_0000000000000_00_0000,
  reorderNodes                  = 0b00000_1000000_0000000000000_00_0000,
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
