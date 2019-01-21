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
  isContainerless       = 0b000100000000
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

export enum LifecycleFlags {
  none                      = 0b000_0000_00000000000000_000_00,
  mustEvaluate              = 0b000_0001_00000000000000_000_00,
  mutation                  = 0b000_0000_00000000000000_000_11,
  isCollectionMutation      = 0b000_0000_00000000000000_000_01,
  isInstanceMutation        = 0b000_0000_00000000000000_000_10,
  update                    = 0b000_0000_00000000000000_111_00,
  updateTargetObserver      = 0b000_0000_00000000000000_001_00,
  updateTargetInstance      = 0b000_0000_00000000000000_010_00,
  updateSourceExpression    = 0b000_0000_00000000000000_100_00,
  from                      = 0b000_0000_11111111111111_000_00,
  fromFlush                 = 0b000_0000_00000000000111_000_00,
  fromAsyncFlush            = 0b000_0000_00000000000001_000_00,
  fromSyncFlush             = 0b000_0000_00000000000010_000_00,
  fromTick                  = 0b000_0000_00000000000100_000_00,
  fromStartTask             = 0b000_0000_00000000001000_000_00,
  fromStopTask              = 0b000_0000_00000000010000_000_00,
  fromBind                  = 0b000_0000_00000000100000_000_00,
  fromUnbind                = 0b000_0000_00000001000000_000_00,
  fromAttach                = 0b000_0000_00000010000000_000_00,
  fromDetach                = 0b000_0000_00000100000000_000_00,
  fromCache                 = 0b000_0000_00001000000000_000_00,
  fromDOMEvent              = 0b000_0000_00010000000000_000_00,
  fromObserverSetter        = 0b000_0000_00100000000000_000_00,
  fromBindableHandler       = 0b000_0000_01000000000000_000_00,
  fromLifecycleTask         = 0b000_0000_10000000000000_000_00,
  parentUnmountQueued       = 0b000_0010_00000000000000_000_00,
  // this flag is for the synchronous flush before detach (no point in updating the
  // DOM if it's about to be detached)
  doNotUpdateDOM            = 0b000_0100_00000000000000_000_00,
  isTraversingParentScope   = 0b000_1000_00000000000000_000_00,
  // Bitmask for flags that need to be stored on a binding during $bind for mutation
  // callbacks outside of $bind
  persistentBindingFlags    = 0b111_0000_00000000000000_000_00,
  allowParentScopeTraversal = 0b001_0000_00000000000000_000_00,
  useProxies                = 0b010_0000_00000000000000_000_00,
  keyedMode                 = 0b100_0000_00000000000000_000_00,
}

export function stringifyLifecycleFlags(flags: LifecycleFlags): string {
  const flagNames: string[] = [];

  if (flags & LifecycleFlags.mustEvaluate) { flagNames.push('mustEvaluate'); }
  if (flags & LifecycleFlags.isCollectionMutation) { flagNames.push('isCollectionMutation'); }
  if (flags & LifecycleFlags.isInstanceMutation) { flagNames.push('isInstanceMutation'); }
  if (flags & LifecycleFlags.updateTargetObserver) { flagNames.push('updateTargetObserver'); }
  if (flags & LifecycleFlags.updateTargetInstance) { flagNames.push('updateTargetInstance'); }
  if (flags & LifecycleFlags.updateSourceExpression) { flagNames.push('updateSourceExpression'); }
  if (flags & LifecycleFlags.fromAsyncFlush) { flagNames.push('fromAsyncFlush'); }
  if (flags & LifecycleFlags.fromSyncFlush) { flagNames.push('fromSyncFlush'); }
  if (flags & LifecycleFlags.fromStartTask) { flagNames.push('fromStartTask'); }
  if (flags & LifecycleFlags.fromStopTask) { flagNames.push('fromStopTask'); }
  if (flags & LifecycleFlags.fromBind) { flagNames.push('fromBind'); }
  if (flags & LifecycleFlags.fromUnbind) { flagNames.push('fromUnbind'); }
  if (flags & LifecycleFlags.fromAttach) { flagNames.push('fromAttach'); }
  if (flags & LifecycleFlags.fromDetach) { flagNames.push('fromDetach'); }
  if (flags & LifecycleFlags.fromCache) { flagNames.push('fromCache'); }
  if (flags & LifecycleFlags.fromDOMEvent) { flagNames.push('fromDOMEvent'); }
  if (flags & LifecycleFlags.fromObserverSetter) { flagNames.push('fromObserverSetter'); }
  if (flags & LifecycleFlags.fromBindableHandler) { flagNames.push('fromBindableHandler'); }
  if (flags & LifecycleFlags.fromLifecycleTask) { flagNames.push('fromLifecycleTask'); }
  if (flags & LifecycleFlags.parentUnmountQueued) { flagNames.push('parentUnmountQueued'); }
  if (flags & LifecycleFlags.doNotUpdateDOM) { flagNames.push('doNotUpdateDOM'); }
  if (flags & LifecycleFlags.isTraversingParentScope) { flagNames.push('isTraversingParentScope'); }
  if (flags & LifecycleFlags.allowParentScopeTraversal) { flagNames.push('allowParentScopeTraversal'); }
  if (flags & LifecycleFlags.useProxies) { flagNames.push('useProxies'); }

  return flagNames.join('|');
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
  ForOfStatement       = 0b000000000001_10111, //                                           Connects
  Interpolation        = 0b000000000000_11000  //
}
