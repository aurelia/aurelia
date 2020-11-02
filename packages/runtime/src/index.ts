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
  TwoWayBindingBehavior
} from './binding-behaviors/binding-mode';
import { DebounceBindingBehavior } from './binding-behaviors/debounce';
import { SignalBindingBehavior } from './binding-behaviors/signals';
import { ThrottleBindingBehavior } from './binding-behaviors/throttle';

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
} from './alias';
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
} from './binding/ast';
export {
  PropertyBinding
} from './binding/property-binding';
export {
  CallBinding
} from './binding/call-binding';
export {
  IPartialConnectableBinding,
  IConnectableBinding,
  connectable,
  BindingMediator,
  MediatedBinding
} from './binding/connectable';
export {
  IExpressionParser,
  BindingType,
  parseExpression,
  Char,
  Access,
  Precedence,
  parse,
  ParserState,
} from './binding/expression-parser';
export {
  ContentBinding,
  InterpolationBinding,
} from './binding/interpolation-binding';
export {
  LetBinding
} from './binding/let-binding';
export {
  RefBinding
} from './binding/ref-binding';

export {
  ArrayObserver,
  ArrayIndexObserver,
  enableArrayObservation,
  disableArrayObservation,
  applyMutationsToIndices,
  synchronizeIndices,
} from './observation/array-observer';
export {
  MapObserver,
  enableMapObservation,
  disableMapObservation
} from './observation/map-observer';
export {
  SetObserver,
  enableSetObservation,
  disableSetObservation
} from './observation/set-observer';
export {
  BindingContext,
  Scope,
  OverrideContext
} from './observation/binding-context';
export {
  CollectionLengthObserver,
} from './observation/collection-length-observer';
export {
  CollectionSizeObserver,
} from './observation/collection-size-observer';
export {
  ComputedOverrides,
  ComputedLookup,
  computed,
  createComputedObserver,
  CustomSetterObserver,
  GetterObserver,
  ComputedWatcher,
  ExpressionWatcher,
} from './observation/computed-observer';
export {
  IDirtyChecker,
  DirtyCheckProperty,
  DirtyCheckSettings
} from './observation/dirty-checker';
export {
  IObservableDefinition,
  observable,
} from './observation/observable';
export {
  IObjectObservationAdapter,
  IObserverLocator,
  ITargetObserverLocator,
  ITargetAccessorLocator,
  getCollectionObserver,
  ObserverLocator
} from './observation/observer-locator';
export {
  PrimitiveObserver,
} from './observation/primitive-observer';
export {
  PropertyAccessor,
} from './observation/property-accessor';
export {
  ProxyObservable,
} from './observation/proxy-observation';
export {
  BindableObserver,
} from './observation/bindable-observer';
export {
  SetterObserver,
} from './observation/setter-observer';
export {
  ISignaler,
} from './observation/signaler';
export {
  subscriberCollection,
  collectionSubscriberCollection,
} from './observation/subscriber-collection';
export {
  IWatcher,
} from './observation/watcher-switcher';

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
} from './binding-behavior';
export {
  BindingModeBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  TwoWayBindingBehavior
} from './binding-behaviors/binding-mode';
export {
  DebounceBindingBehavior
} from './binding-behaviors/debounce';
export {
  SignalBindingBehavior
} from './binding-behaviors/signals';
export {
  ThrottleBindingBehavior
} from './binding-behaviors/throttle';

export {
  ValueConverter,
  ValueConverterDefinition,
  PartialValueConverterDefinition,
  ValueConverterKind,
  ValueConverterDecorator,
  ValueConverterInstance,
  ValueConverterType,
  valueConverter,
} from './value-converter';

export {
  bindable,
  PartialBindableDefinition,
  BindableDefinition,
  Bindable,
} from './bindable';

export {
  watch,
  Watch,
  IWatchDefinition,
  IWatcherCallback,
  IDepCollectionFn,
} from './observation/watch';

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
  INodeAccessor,
  IBindingContext,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICollectionChangeTracker,
  ICollectionObserver,
  ICollectionIndexObserver,
  ICollectionSubscriber,
  IndexMap,
  IBatchable,
  IObservable,
  IObservedArray,
  IObservedMap,
  IObservedSet,
  IOverrideContext,
  IPropertyChangeTracker,
  IPropertyObserver,
  ISubscribable,
  ISubscriberCollection,
  ObservedCollection,
  PropertyObserver,
  CollectionObserver,
  ICollectionSubscriberCollection,
  ICollectionSubscribable,
  ISubscriber,
  isIndexMap,
  copyIndexMap,
  cloneIndexMap,
  createIndexMap,
} from './observation';
