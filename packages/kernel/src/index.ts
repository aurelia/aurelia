export {
  IPlatform,
} from './platform';

export {
  all,
  factory,
  type IAllResolver,
  type IFactoryResolver,
  type IOptionalResolver,
  type IResolvedFactory,
  type INewInstanceResolver,
  DI,
  IContainer,
  type IFactory,
  inject,
  type IRegistration,
  type IRegistry,
  type IResolver,
  IServiceLocator,
  type Key,
  lazy,
  type ILazyResolver,
  type IResolvedLazy,
  optional,
  ignore,
  type RegisterSelf,
  Registration,
  type ResolveCallback,
  singleton,
  transient,
  type AbstractInjectable,
  type Injectable,
  type InterfaceSymbol,
  InstanceProvider,
  type Resolved,
  type Transformer,
  newInstanceForScope,
  newInstanceOf,
  ContainerConfiguration,
  DefaultResolver,
  type IContainerConfiguration,
} from './di';

export {
  resolve,
  type IResolvedInjection,
} from './di.container';

export {
  type Class,
  type Constructable,
  type ConstructableClass,
  type IDisposable,
  type IIndexable,
  type Overwrite,
  type Primitive,
  type Writable,
} from './interfaces';

export {
  LogLevel,
  type IConsoleLike,
  ColorOptions,
  ILogConfig,
  type ILogEvent,
  ILogEventFactory,
  ISink,
  ILogger,
  LogConfig,
  DefaultLogEvent,
  DefaultLogEventFactory,
  DefaultLogger,
  ConsoleSink,
  LoggerConfiguration,
  format,
  sink,
} from './logger';

export {
  type IModule,
  IModuleLoader,
  AnalyzedModule,
  ModuleItem,
} from './module-loader';

export {
  noop,
  emptyArray,
  emptyObject,
} from './platform';

export {
  type IResourceKind,
  type PartialResourceDefinition,
  Protocol,
  type ResourceDefinition,
  type ResourceType,
  fromAnnotationOrDefinitionOrTypeOrDefault,
  fromAnnotationOrTypeOrDefault,
  fromDefinitionOrDefault,
} from './resource';

export {
  EventAggregator,
  IEventAggregator,
} from './eventaggregator';

export {
  isArrayIndex,
  camelCase,
  kebabCase,
  pascalCase,
  toArray,
  bound,
  mergeArrays,
  firstDefined,
  getPrototypeChain,
  isNativeFunction,
  onResolve,
  resolveAll,
} from './functions';

export {
  type AnyFunction,
  type FunctionPropNames,
  type MaybePromise,
} from './utilities';
