import { Platform } from '@aurelia/platform';
export interface IPlatform extends Platform {
}
export declare const IPlatform: import("./di.js").InterfaceSymbol<IPlatform>;
export { Platform, TaskQueue, Task, TaskAbortError, TaskQueuePriority, TaskStatus, QueueTaskOptions, ITask, } from '@aurelia/platform';
export { all, DI, IContainer, IFactory, inject, IRegistration, IRegistry, IResolver, IServiceLocator, Key, lazy, optional, ignore, RegisterSelf, Registration, ResolveCallback, singleton, transient, Injectable, InterfaceSymbol, InstanceProvider, Resolved, Transformer, newInstanceForScope, newInstanceOf, ContainerConfiguration, DefaultResolver, IContainerConfiguration, } from './di.js';
export { Class, Constructable, ConstructableClass, IDisposable, IIndexable, Overwrite, Primitive, Writable, } from './interfaces.js';
export { metadata, Metadata, isNullOrUndefined, isObject, applyMetadataPolyfill, } from '@aurelia/metadata';
export { LogLevel, IConsoleLike, ColorOptions, ILogConfig, ILogEvent, ILogEventFactory, ISink, ILogger, LogConfig, DefaultLogEvent, DefaultLogEventFactory, DefaultLogger, ConsoleSink, LoggerConfiguration, format, sink, } from './logger.js';
export { IModule, IModuleLoader, AnalyzedModule, ModuleItem, } from './module-loader';
export { noop, emptyArray, emptyObject, } from './platform.js';
export { IResourceKind, PartialResourceDefinition, Protocol, ResourceDefinition, ResourceType, fromAnnotationOrDefinitionOrTypeOrDefault, fromAnnotationOrTypeOrDefault, fromDefinitionOrDefault, } from './resource.js';
export { EventAggregator, IEventAggregator, } from './eventaggregator.js';
export { isArrayIndex, camelCase, kebabCase, pascalCase, toArray, nextId, resetId, compareNumber, mergeDistinct, isNumberOrBigInt, isStringOrDate, bound, mergeArrays, mergeObjects, firstDefined, getPrototypeChain, isNativeFunction, onResolve, resolveAll, } from './functions.js';
//# sourceMappingURL=index.d.ts.map