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
   *
   * Cannot be combined with `proxies` or `patch`.
   */
  getterSetter = 0b0001,
  /**
   * Configures all components "below" this one to operate in proxy binding mode.
   * No getters/setters are created.
   *
   * This strategy consumes significantly fewer resources than `getterSetter` on initialization and has the best performance on infrequently updated bindings on
   * components that are frequently replaced.
   * However, it consumes more resources on updates.
   *
   * Cannot be combined with `getterSetter` or `patch`.
   */
  proxies      = 0b0010,
  /**
   * Configures all components "below" this one to operate in patched binding mode.
   * Nothing is observed; to propagate changes, you manually need to call `$patch` on the component.
   *
   * This strategy consumes the least amount of resources and has the fastest initialization.
   * Performance on updates will depend heavily on how it's used, but tends to be worse on a large number of
   * nested bindings/components due to a larger number of reads on all properties.
   *
   * Cannot be combined with `getterSetter` or `proxies`.
   */
  patch        = 0b0100,
  /**
   * Configures any repeaters "below" this component to operate in keyed mode.
   * To only put a single repeater in that mode, use `& keyed` (this will change to track-by etc soon)
   *
   * Can be combined with either `getterSetter`, `proxies` or `patch`.
   */
  keyed        = 0b1000
}

const mandatoryStrategy = BindingStrategy.getterSetter | BindingStrategy.proxies | BindingStrategy.patch;

export function ensureValidStrategy(strategy: BindingStrategy | null | undefined): BindingStrategy {
  if ((strategy & mandatoryStrategy) === 0 || strategy === BindingStrategy.keyed) {
    // TODO: probably want to validate that user isn't trying to mix proxy/patch, getterSetter/patch, getterSetter/proxy
    // TODO: also need to make sure that strategy can be changed away from patch/proxies inside the component tree (not here though, but just making a note)
    return strategy | BindingStrategy.getterSetter;
  }
  return strategy;
}

export const enum State {
  none                  = 0b000000000000,
  isBinding             = 0b000000000001,
  isBound               = 0b000000000010,
  isAttaching           = 0b000000000100,
  isAttached            = 0b000000001000,
  isMounted             = 0b000000010000,
  isDetaching           = 0b000000100000,
  isUnbinding           = 0b000001000000,
  isCached              = 0b000010000000,
  isContainerless       = 0b000100000000,
  isPatching            = 0b001000000000
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
  none                      = 0b0_0000000_000000000000000_00_00_0000,
  allowPublishRoundtrip     = 0b0_0000001_000000000000000_00_00_0000,
  isPublishing              = 0b0_0000010_000000000000000_00_00_0000,
  mustEvaluate              = 0b0_0000100_000000000000000_00_00_0000,
  bindingStrategy           = 0b0_0000000_000000000000000_00_00_1111,
  getterSetterStrategy      = 0b0_0000000_000000000000000_00_00_0001,
  proxyStrategy             = 0b0_0000000_000000000000000_00_00_0010,
  patchStrategy             = 0b0_0000000_000000000000000_00_00_0100,
  keyedStrategy             = 0b0_0000000_000000000000000_00_00_1000,
  mutation                  = 0b0_0000000_000000000000000_00_11_0000,
  isCollectionMutation      = 0b0_0000000_000000000000000_00_01_0000,
  isInstanceMutation        = 0b0_0000000_000000000000000_00_10_0000,
  update                    = 0b0_0000000_000000000000000_11_00_0000,
  updateTargetInstance      = 0b0_0000000_000000000000000_01_00_0000,
  updateSourceExpression    = 0b0_0000000_000000000000000_10_00_0000,
  from                      = 0b0_0000000_111111111111111_00_00_0000,
  fromFlush                 = 0b0_0000000_000000000000111_00_00_0000,
  fromAsyncFlush            = 0b0_0000000_000000000000001_00_00_0000,
  fromSyncFlush             = 0b0_0000000_000000000000010_00_00_0000,
  fromTick                  = 0b0_0000000_000000000000100_00_00_0000,
  fromStartTask             = 0b0_0000000_000000000001000_00_00_0000,
  fromStopTask              = 0b0_0000000_000000000010000_00_00_0000,
  fromBind                  = 0b0_0000000_000000000100000_00_00_0000,
  fromUnbind                = 0b0_0000000_000000001000000_00_00_0000,
  fromAttach                = 0b0_0000000_000000010000000_00_00_0000,
  fromDetach                = 0b0_0000000_000000100000000_00_00_0000,
  fromCache                 = 0b0_0000000_000001000000000_00_00_0000,
  fromDOMEvent              = 0b0_0000000_000010000000000_00_00_0000,
  fromObserverSetter        = 0b0_0000000_000100000000000_00_00_0000,
  fromBindableHandler       = 0b0_0000000_001000000000000_00_00_0000,
  fromLifecycleTask         = 0b0_0000000_010000000000000_00_00_0000,
  fromGetterSetter          = 0b0_0000000_100000000000000_00_00_0000,
  parentUnmountQueued       = 0b0_0001000_000000000000000_00_00_0000,
  // this flag is for the synchronous flush before detach (no point in updating the
  // DOM if it's about to be detached)
  doNotUpdateDOM            = 0b0_0010000_000000000000000_00_00_0000,
  isTraversingParentScope   = 0b0_0100000_000000000000000_00_00_0000,
  isOriginalArray           = 0b0_1000000_000000000000000_00_00_0000,
  // Bitmask for flags that need to be stored on a binding during $bind for mutation
  // callbacks outside of $bind
  persistentBindingFlags    = 0b1_0000000_000000000000000_00_00_1111,
  allowParentScopeTraversal = 0b1_0000000_000000000000000_00_00_0000,
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
