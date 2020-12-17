import { DI } from './di.js';
export const IPlatform = DI.createInterface('IPlatform');
export { Platform, TaskQueue, Task, TaskAbortError, TaskQueuePriority, TaskStatus, } from '@aurelia/platform';
export { all, DI, IContainer, inject, IServiceLocator, lazy, optional, ignore, Registration, singleton, transient, InstanceProvider, newInstanceForScope, newInstanceOf, ContainerConfiguration, DefaultResolver, } from './di.js';
export { metadata, Metadata, isNullOrUndefined, isObject, applyMetadataPolyfill, } from '@aurelia/metadata';
export { LogLevel, ColorOptions, ILogConfig, ILogEventFactory, ISink, ILogger, LogConfig, DefaultLogEvent, DefaultLogEventFactory, DefaultLogger, ConsoleSink, LoggerConfiguration, format, sink, } from './logger.js';
export { IModuleLoader, AnalyzedModule, ModuleItem, } from './module-loader';
export { noop, emptyArray, emptyObject, } from './platform.js';
export { Protocol, fromAnnotationOrDefinitionOrTypeOrDefault, fromAnnotationOrTypeOrDefault, fromDefinitionOrDefault, } from './resource.js';
export { EventAggregator, IEventAggregator, } from './eventaggregator.js';
export { isArrayIndex, camelCase, kebabCase, pascalCase, toArray, nextId, resetId, compareNumber, mergeDistinct, isNumberOrBigInt, isStringOrDate, bound, mergeArrays, mergeObjects, firstDefined, getPrototypeChain, isNativeFunction, onResolve, resolveAll, } from './functions.js';
//# sourceMappingURL=index.js.map