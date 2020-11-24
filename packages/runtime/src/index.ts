export {
  IPlatform,
} from '@aurelia/kernel';
export {
  Platform,
  TaskQueue,
  Task,
  TaskAbortError,
  TaskQueuePriority,
  TaskStatus,
  QueueTaskOptions,
  ITask,
} from '@aurelia/platform';

import { IRegistry } from '@aurelia/kernel';
import {
  FromViewBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  TwoWayBindingBehavior,
} from './binding-behaviors/binding-mode.js';
import { DebounceBindingBehavior } from './binding-behaviors/debounce.js';
import { SignalBindingBehavior } from './binding-behaviors/signals.js';
import { ThrottleBindingBehavior } from './binding-behaviors/throttle.js';

export const DebounceBindingBehaviorRegistration = DebounceBindingBehavior as unknown as IRegistry;
export const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior as unknown as IRegistry;
export const ToViewBindingBehaviorRegistration = ToViewBindingBehavior as unknown as IRegistry;
export const FromViewBindingBehaviorRegistration = FromViewBindingBehavior as unknown as IRegistry;
export const SignalBindingBehaviorRegistration = SignalBindingBehavior as unknown as IRegistry;
export const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior as unknown as IRegistry;
export const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior as unknown as IRegistry;

export {
  alias,
  registerAliases,
} from './alias.js';
export {
  ExpressionKind,
  CallFunctionExpression,
  CustomExpression,
  BindingBehaviorExpression,
  ValueConverterExpression,
  AssignExpression,
  ConditionalExpression,
  AccessThisExpression,
  AccessScopeExpression,
  AccessMemberExpression,
  AccessKeyedExpression,
  CallScopeExpression,
  CallMemberExpression,
  BinaryExpression,
  UnaryExpression,
  PrimitiveLiteralExpression,
  HtmlLiteralExpression,
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  TemplateExpression,
  TaggedTemplateExpression,
  ArrayBindingPattern,
  ObjectBindingPattern,
  BindingIdentifier,
  ForOfStatement,
  Interpolation,
  AnyBindingExpression,
  IsPrimary,
  IsLiteral,
  IsLeftHandSide,
  IsUnary,
  IsBinary,
  IsConditional,
  IsAssign,
  IsValueConverter,
  IsBindingBehavior,
  IsAssignable,
  IsExpression,
  IsExpressionOrStatement,
  IVisitor,
  BinaryOperator,
  BindingIdentifierOrPattern,
  UnaryOperator,
  IExpressionHydrator,
} from './binding/ast.js';
export {
  PropertyBinding
} from './binding/property-binding.js';
export {
  CallBinding
} from './binding/call-binding.js';
export {
  IPartialConnectableBinding,
  IConnectableBinding,
  connectable,
  BindingMediator,
  MediatedBinding
} from './binding/connectable.js';
export {
  IExpressionParser,
  BindingType,
  parseExpression,
  Char,
  Access,
  Precedence,
  parse,
  ParserState,
} from './binding/expression-parser.js';
export {
  ContentBinding,
  InterpolationBinding,
} from './binding/interpolation-binding.js';
export {
  LetBinding,
} from './binding/let-binding.js';
export {
  RefBinding,
} from './binding/ref-binding.js';

export {
  ArrayObserver,
  ArrayIndexObserver,
  enableArrayObservation,
  disableArrayObservation,
  applyMutationsToIndices,
  synchronizeIndices,
} from './observation/array-observer.js';
export {
  MapObserver,
  enableMapObservation,
  disableMapObservation,
} from './observation/map-observer.js';
export {
  SetObserver,
  enableSetObservation,
  disableSetObservation
} from './observation/set-observer.js';
export {
  BindingContext,
  Scope,
  OverrideContext,
} from './observation/binding-context.js';
export {
  CollectionLengthObserver,
} from './observation/collection-length-observer.js';
export {
  CollectionSizeObserver,
} from './observation/collection-size-observer.js';
export {
  ComputedObserver,
  ComputedWatcher,
  ExpressionWatcher,
} from './observation/computed-observer.js';
export {
  IDirtyChecker,
  DirtyCheckProperty,
  DirtyCheckSettings,
} from './observation/dirty-checker.js';
export {
  IObservableDefinition,
  observable,
} from './observation/observable.js';
export {
  IObjectObservationAdapter,
  IObserverLocator,
  INodeObserverLocator,
  getCollectionObserver,
  ObserverLocator,
} from './observation/observer-locator.js';
export {
  PrimitiveObserver,
} from './observation/primitive-observer.js';
export {
  PropertyAccessor,
} from './observation/property-accessor.js';
export {
  ProxyObservable,
} from './observation/proxy-observation.js';
export {
  SetterObserver,
} from './observation/setter-observer.js';
export {
  ISignaler,
} from './observation/signaler.js';
export {
  subscriberCollection,
  collectionSubscriberCollection,
} from './observation/subscriber-collection.js';
export {
  IWatcher,
  WatcherSwitcher,
} from './observation/watcher-switcher.js';

export {
  bindingBehavior,
  BindingBehavior,
  BindingBehaviorDefinition,
  PartialBindingBehaviorDefinition,
  BindingBehaviorKind,
  BindingBehaviorDecorator,
  BindingBehaviorInstance,
  BindingBehaviorType,
  BindingInterceptor,
  BindingBehaviorFactory,
  BindingBehaviorStrategy,
  IInterceptableBinding,
} from './binding-behavior.js';
export {
  BindingModeBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  TwoWayBindingBehavior,
} from './binding-behaviors/binding-mode.js';
export {
  DebounceBindingBehavior,
} from './binding-behaviors/debounce.js';
export {
  SignalBindingBehavior,
} from './binding-behaviors/signals.js';
export {
  ThrottleBindingBehavior,
} from './binding-behaviors/throttle.js';

export {
  ValueConverter,
  ValueConverterDefinition,
  PartialValueConverterDefinition,
  ValueConverterKind,
  ValueConverterDecorator,
  ValueConverterInstance,
  ValueConverterType,
  valueConverter,
} from './value-converter.js';

export {
  watch,
  Watch,
  IWatchDefinition,
  IWatcherCallback,
  IDepCollectionFn,
} from './observation/watch.js';

export {
  BindingMode,
  LifecycleFlags,
  AccessorOrObserver,
  IBinding,
  ILifecycle,
  AccessorType,
  Collection,
  CollectionKind,
  DelegationStrategy,
  IAccessor,
  IBindingContext,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICollectionChangeTracker,
  ICollectionObserver,
  ICollectionIndexObserver,
  ICollectionSubscriber,
  IndexMap,
  IBatchable,
  IObserver,
  IObservable,
  IOverrideContext,
  InterceptorFunc,
  IPropertyChangeTracker,
  IPropertyObserver,
  ISubscribable,
  ISubscriberCollection,
  PropertyObserver,
  CollectionObserver,
  ICollectionSubscriberCollection,
  ICollectionSubscribable,
  ISubscriber,
  isIndexMap,
  copyIndexMap,
  cloneIndexMap,
  createIndexMap,
} from './observation.js';
