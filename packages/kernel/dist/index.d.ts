import { Platform } from '@aurelia/platform';
export interface IPlatform extends Platform {
}
export declare const IPlatform: import("./di").InterfaceSymbol<IPlatform>;
export { Platform, TaskQueue, Task, TaskAbortError, TaskQueuePriority, TaskStatus, QueueTaskOptions, ITask, } from '@aurelia/platform';
export { all, DI, IContainer, IDefaultableInterfaceSymbol, IFactory, inject, IRegistration, IRegistry, IResolver, IServiceLocator, Key, lazy, optional, ignore, RegisterSelf, Registration, ResolveCallback, singleton, transient, Injectable, InterfaceSymbol, InstanceProvider, Resolved, Transformer, newInstanceForScope, newInstanceOf, DefaultContainerConfiguration, DefaultResolver, IContainerConfiguration, } from './di';
export { Class, Constructable, ConstructableClass, IDisposable, IIndexable, Overwrite, Primitive, Writable, } from './interfaces';
export { metadata, Metadata, isNullOrUndefined, isObject, applyMetadataPolyfill, } from '@aurelia/metadata';
export { LogLevel, IConsoleLike, ColorOptions, ILogConfig, ILogEvent, ILogEventFactory, ISink, ILogger, LogConfig, DefaultLogEvent, DefaultLogEventFactory, DefaultLogger, ConsoleSink, LoggerConfiguration, format, sink, } from './logger';
export { noop, emptyArray, emptyObject, } from './platform';
export { IResourceKind, PartialResourceDefinition, Protocol, ResourceDefinition, ResourceType, fromAnnotationOrDefinitionOrTypeOrDefault, fromAnnotationOrTypeOrDefault, fromDefinitionOrDefault, } from './resource';
export { EventAggregator, IEventAggregator, } from './eventaggregator';
export { isArrayIndex, camelCase, kebabCase, pascalCase, toArray, nextId, resetId, compareNumber, mergeDistinct, isNumberOrBigInt, isStringOrDate, bound, mergeArrays, mergeObjects, firstDefined, getPrototypeChain, isNativeFunction, onResolve, resolveAll, } from './functions';
//# sourceMappingURL=index.d.ts.map