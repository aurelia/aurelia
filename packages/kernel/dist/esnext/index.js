import { DI } from './di';
export const IPlatform = DI.createInterface('IPlatform').noDefault();
export { Platform, TaskQueue, Task, TaskAbortError, TaskQueuePriority, TaskStatus, } from '@aurelia/platform';
export { all, DI, IContainer, inject, IServiceLocator, lazy, optional, ignore, Registration, singleton, transient, InstanceProvider, newInstanceForScope, newInstanceOf, DefaultContainerConfiguration, DefaultResolver, } from './di';
export { metadata, Metadata, isNullOrUndefined, isObject, applyMetadataPolyfill, } from '@aurelia/metadata';
export { LogLevel, ColorOptions, ILogConfig, ILogEventFactory, ISink, ILogger, LogConfig, DefaultLogEvent, DefaultLogEventFactory, DefaultLogger, ConsoleSink, LoggerConfiguration, format, sink, } from './logger';
export { noop, emptyArray, emptyObject, } from './platform';
export { Protocol, fromAnnotationOrDefinitionOrTypeOrDefault, fromAnnotationOrTypeOrDefault, fromDefinitionOrDefault, } from './resource';
export { EventAggregator, IEventAggregator, } from './eventaggregator';
export { isArrayIndex, camelCase, kebabCase, pascalCase, toArray, nextId, resetId, compareNumber, mergeDistinct, isNumberOrBigInt, isStringOrDate, bound, mergeArrays, mergeObjects, firstDefined, getPrototypeChain, isNativeFunction, onResolve, resolveAll, } from './functions';
//# sourceMappingURL=index.js.map