(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const marker = {
        objName: 'marker',
        methodName: 'noop',
        params: kernel_1.PLATFORM.emptyArray,
        depth: -1,
        prev: null,
        next: null
    };
    class TraceInfo {
        constructor(objName, methodName, params) {
            this.objName = objName;
            this.methodName = methodName;
            this.depth = TraceInfo.stack.length;
            this.params = params;
            this.next = marker;
            this.prev = TraceInfo.tail;
            TraceInfo.tail.next = this;
            TraceInfo.tail = this;
            TraceInfo.stack.push(this);
        }
        static reset() {
            let current = TraceInfo.head;
            let next = null;
            while (current != null) {
                next = current.next;
                current.next = null;
                current.prev = null;
                current.params = null;
                current = next;
            }
            TraceInfo.head = marker;
            TraceInfo.tail = marker;
            TraceInfo.stack = [];
        }
        static enter(objName, methodName, params) {
            return new TraceInfo(objName, methodName, params);
        }
        static leave() {
            return TraceInfo.stack.pop();
        }
    }
    TraceInfo.head = marker;
    TraceInfo.tail = marker;
    TraceInfo.stack = [];
    exports.DebugTracer = {
        ...kernel_1.Tracer,
        /**
         * A convenience property for the user to conditionally call the tracer.
         * This saves unnecessary `noop` and `slice` calls in non-AOT scenarios even if debugging is disabled.
         * In AOT these calls will simply be removed entirely.
         *
         * This property **only** turns on tracing if `@aurelia/debug` is included and configured as well.
         */
        enabled: false,
        liveLoggingEnabled: false,
        liveWriter: null,
        /**
         * Call this at the start of a method/function.
         * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
         *
         * @param objName - Any human-friendly name to identify the traced object with.
         * @param methodName - Any human-friendly name to identify the traced method with.
         * @param args - Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
         */
        enter(objName, methodName, args) {
            if (this.enabled) {
                const info = TraceInfo.enter(objName, methodName, args);
                if (this.liveLoggingEnabled) {
                    this.liveWriter.write(info);
                }
            }
        },
        /**
         * Call this at the end of a method/function. Pops one trace item off the stack.
         */
        leave() {
            if (this.enabled) {
                TraceInfo.leave();
            }
        },
        /**
         * Writes only the trace info leading up to the current method call.
         *
         * @param writer - An object to write the output to.
         */
        writeStack(writer) {
            let i = 0;
            const stack = TraceInfo.stack;
            const len = stack.length;
            while (i < len) {
                writer.write(stack[i]);
                ++i;
            }
        },
        /**
         * Writes all trace info captured since the previous flushAll operation.
         *
         * @param writer - An object to write the output to. Can be null to simply reset the tracer state.
         */
        flushAll(writer) {
            if (writer != null) {
                let current = TraceInfo.head.next; // skip the marker
                while (current != null && current !== marker) {
                    writer.write(current);
                    current = current.next;
                }
            }
            TraceInfo.reset();
        },
        enableLiveLogging,
        /**
         * Stops writing out each trace info item as they are traced.
         */
        disableLiveLogging() {
            this.liveLoggingEnabled = false;
            this.liveWriter = null;
        }
    };
    const defaultOptions = Object.freeze({
        rendering: true,
        binding: true,
        observation: true,
        attaching: true,
        mounting: true,
        di: true,
        lifecycle: true,
        jit: true
    });
    function enableLiveLogging(optionsOrWriter) {
        this.liveLoggingEnabled = true;
        if (optionsOrWriter && 'write' in optionsOrWriter) {
            this.liveWriter = optionsOrWriter;
        }
        else {
            const options = optionsOrWriter !== undefined ? optionsOrWriter : defaultOptions;
            this.liveWriter = createLiveTraceWriter(options);
        }
    }
    const toString = Object.prototype.toString;
    function flagsText(info, i = 0) {
        if (info.params != null && info.params.length > i) {
            return stringifyLifecycleFlags(info.params[i]);
        }
        return 'none';
    }
    function _ctorName(obj) {
        let name;
        if (obj === undefined) {
            name = 'undefined';
        }
        else if (obj === null) {
            name = 'null';
        }
        else if (obj.constructor !== undefined) {
            if (obj.constructor.description) {
                name = `Resource{'${obj.constructor.description.name}'}`;
            }
            else {
                name = obj.constructor.name;
            }
        }
        else if (typeof obj === 'string') {
            name = `'${obj}'`;
        }
        else {
            name = toString.call(obj);
        }
        return name;
    }
    function ctorName(info, i = 0) {
        if (info.params != null && info.params.length > i) {
            return _ctorName(info.params[i]);
        }
        return 'undefined';
    }
    function scopeText(info, i = 0) {
        let $ctorName;
        if (info.params != null && info.params.length > i) {
            const $scope = info.params[i];
            if ($scope != null && $scope.bindingContext != null) {
                $ctorName = _ctorName($scope.bindingContext);
            }
            else {
                $ctorName = 'undefined';
            }
            return `Scope{${$ctorName}}`;
        }
        return 'undefined';
    }
    function keyText(info, i = 0) {
        if (info.params != null && info.params.length > i) {
            const $key = info.params[i];
            if (typeof $key === 'string') {
                return `'${$key}'`;
            }
            if ($key !== undefined && Reflect.has($key, 'friendlyName')) {
                return $key['friendlyName'];
            }
            return _ctorName($key);
        }
        return 'undefined';
    }
    function primitive(info, i = 0) {
        if (info.params != null && info.params.length > i) {
            const $key = info.params[i];
            if (typeof $key === 'string') {
                return `'${$key}'`;
            }
            return $key.toString();
        }
        return 'undefined';
    }
    const RenderingArgsProcessor = {
        $hydrate(info) {
            return flagsText(info);
        },
        render(info) {
            return `${flagsText(info)},IDOM,IRenderContext,${ctorName(info, 3)}`;
        },
        addBinding(info) {
            return `${ctorName(info)},${ctorName(info, 1)}`;
        },
        addComponent(info) {
            return `${ctorName(info)},${ctorName(info, 1)}`;
        }
    };
    const BindingArgsProcessor = {
        $bind(info) {
            return flagsText(info);
        },
        $unbind(info) {
            return flagsText(info);
        },
        connect(info) {
            return flagsText(info);
        },
        // currently only observers trace constructor calls but keep an eye on this if others are added, then we'd need additional filtering
        constructor(info) {
            switch (info.objName) {
                case 'ArrayObserver':
                case 'MapObserver':
                case 'SetObserver':
                    return flagsText(info);
                case 'SetterObserver':
                case 'SelfObserver':
                    return `${flagsText(info)},${ctorName(info, 1)},${primitive(info, 2)}`;
                case 'ProxyObserver':
                    return ctorName(info);
                case 'ProxySubscriberCollection':
                case 'DirtyCheckProperty':
                    return `${ctorName(info, 1)},${primitive(info, 2)}`;
                case 'PrimitiveObserver':
                case 'PropertyAccessor':
                    return `${ctorName(info)},${primitive(info, 1)}`;
                default:
                    return '';
            }
        },
        lockedBind(info) {
            return flagsText(info);
        },
        lockedUnbind(info) {
            return flagsText(info);
        },
        InternalObserversLookup(info) {
            return `${flagsText(info)},${ctorName(info, 1)},${primitive(info, 2)}`;
        },
        BindingContext(info) {
            switch (info.methodName) {
                case 'get':
                    return `${scopeText(info)},${primitive(info, 1)},${primitive(info, 2)},${flagsText(info, 3)}`;
                case 'getObservers':
                    return flagsText(info);
                default:
                    return 'unknown';
            }
        },
        Scope(info) {
            switch (info.methodName) {
                case 'create':
                    return `${flagsText(info)},${ctorName(info, 1)},${ctorName(info, 2)}`;
                case 'fromOverride':
                    return `${flagsText(info)},${ctorName(info, 1)}`;
                case 'fromParent':
                    return `${flagsText(info)},${scopeText(info, 1)},${ctorName(info, 2)}`;
                default:
                    return 'unknown';
            }
        },
        OverrideContext(info) {
            switch (info.methodName) {
                case 'create':
                    return `${flagsText(info)},${ctorName(info, 1)},${ctorName(info, 2)}`;
                case 'getObservers':
                    return '';
                default:
                    return 'unknown';
            }
        }
    };
    const ObservationArgsProcessor = {
        callSource(info) {
            const names = [];
            switch (info.objName) {
                case 'Listener':
                    return (info.params[0]).type;
                case 'CallBinding':
                    if (info.params != null) {
                        for (let i = 0, ii = info.params.length; i < ii; ++i) {
                            names.push(ctorName(info, i));
                        }
                    }
                    return names.join(',');
                default:
                    return 'unknown';
            }
        },
        setValue(info) {
            let valueText;
            const value = info.params[0];
            switch (typeof value) {
                case 'undefined':
                    valueText = 'undefined';
                    break;
                case 'object':
                    if (value === null) {
                        valueText = 'null';
                    }
                    else {
                        valueText = _ctorName(value);
                    }
                    break;
                case 'string':
                    valueText = `'${value}'`;
                    break;
                case 'number':
                    valueText = value.toString();
                    break;
                default:
                    valueText = _ctorName(value);
            }
            return `${valueText},${flagsText(info, 1)}`;
        },
        flush(info) {
            return flagsText(info);
        },
        handleChange(info) {
            return `${primitive(info)},${primitive(info, 1)},${flagsText(info, 2)}`;
        },
        lockScope(info) {
            return scopeText(info);
        }
    };
    const AttachingArgsProcessor = {
        $attach(info) {
            return flagsText(info);
        },
        $detach(info) {
            return flagsText(info);
        },
        $cache(info) {
            return flagsText(info);
        },
        hold(info) {
            return `Node{'${(info.params[0]).textContent}'}`;
        },
        release(info) {
            return flagsText(info);
        }
    };
    const MountingArgsProcessor = {
        $mount(info) {
            return flagsText(info);
        },
        $unmount(info) {
            return flagsText(info);
        },
        project(info) {
            return ctorName(info);
        },
        take(info) {
            return ctorName(info);
        }
    };
    const DIArgsProcessor = {
        construct(info) {
            return ctorName(info);
        },
        Container(info) {
            const names = [];
            switch (info.methodName) {
                case 'get':
                case 'getAll':
                    return keyText(info);
                case 'register':
                    if (info.params != null) {
                        for (let i = 0, ii = info.params.length; i < ii; ++i) {
                            names.push(keyText(info, i));
                        }
                    }
                    return names.join(',');
                case 'createChild':
                    return '';
                default:
                    return 'unknown';
            }
        }
    };
    const LifecycleArgsProcessor = {
        Lifecycle(info) {
            switch (info.methodName.slice(0, 3)) {
                case 'beg':
                    return '';
                case 'enq':
                    return ctorName(info);
                case 'end':
                case 'pro':
                    return flagsText(info);
                default:
                    return 'unknown';
            }
        },
        CompositionCoordinator(info) {
            switch (info.methodName) {
                case 'enqueue':
                    return 'IController';
                case 'swap':
                    return `IController,${flagsText(info, 1)}`;
                case 'processNext':
                    return '';
                default:
                    return 'unknown';
            }
        },
        AggregateLifecycleTask(info) {
            switch (info.methodName) {
                case 'addTask':
                case 'removeTask':
                    return ctorName(info);
                case 'complete':
                    return `${primitive(info, 2)}`;
                default:
                    return 'unknown';
            }
        }
    };
    const JitArgsProcessor = {
        TemplateBinder(info) {
            return ''; // TODO
        }
    };
    function createLiveTraceWriter(options) {
        const Processors = {};
        if (options.rendering) {
            Object.assign(Processors, RenderingArgsProcessor);
        }
        if (options.binding) {
            Object.assign(Processors, BindingArgsProcessor);
        }
        if (options.observation) {
            Object.assign(Processors, ObservationArgsProcessor);
        }
        if (options.attaching) {
            Object.assign(Processors, AttachingArgsProcessor);
        }
        if (options.mounting) {
            Object.assign(Processors, MountingArgsProcessor);
        }
        if (options.di) {
            Object.assign(Processors, DIArgsProcessor);
        }
        if (options.lifecycle) {
            Object.assign(Processors, LifecycleArgsProcessor);
        }
        if (options.jit) {
            Object.assign(Processors, JitArgsProcessor);
        }
        return {
            write(info) {
                let output;
                if (Processors[info.methodName] !== undefined) {
                    output = Processors[info.methodName](info);
                }
                else if (Processors[info.objName] !== undefined) {
                    output = Processors[info.objName](info);
                }
                else {
                    return;
                }
                kernel_1.Reporter.write(10000, `${'-'.repeat(info.depth)}${info.objName}.${info.methodName}(${output})`);
            }
        };
    }
    function stringifyLifecycleFlags(flags) {
        const flagNames = [];
        if (flags & 2097152 /* mustEvaluate */) {
            flagNames.push('mustEvaluate');
        }
        if (flags & 16777216 /* isCollectionMutation */) {
            flagNames.push('isCollectionMutation');
        }
        if (flags & 16 /* updateTargetInstance */) {
            flagNames.push('updateTargetInstance');
        }
        if (flags & 32 /* updateSourceExpression */) {
            flagNames.push('updateSourceExpression');
        }
        if (flags & 64 /* fromAsyncFlush */) {
            flagNames.push('fromAsyncFlush');
        }
        if (flags & 128 /* fromSyncFlush */) {
            flagNames.push('fromSyncFlush');
        }
        if (flags & 256 /* fromTick */) {
            flagNames.push('fromTick');
        }
        if (flags & 1024 /* fromStartTask */) {
            flagNames.push('fromStartTask');
        }
        if (flags & 2048 /* fromStopTask */) {
            flagNames.push('fromStopTask');
        }
        if (flags & 4096 /* fromBind */) {
            flagNames.push('fromBind');
        }
        if (flags & 8192 /* fromUnbind */) {
            flagNames.push('fromUnbind');
        }
        if (flags & 16384 /* fromAttach */) {
            flagNames.push('fromAttach');
        }
        if (flags & 32768 /* fromDetach */) {
            flagNames.push('fromDetach');
        }
        if (flags & 65536 /* fromCache */) {
            flagNames.push('fromCache');
        }
        if (flags & 131072 /* fromDOMEvent */) {
            flagNames.push('fromDOMEvent');
        }
        if (flags & 262144 /* fromLifecycleTask */) {
            flagNames.push('fromLifecycleTask');
        }
        if (flags & 4194304 /* isTraversingParentScope */) {
            flagNames.push('isTraversingParentScope');
        }
        if (flags & 67108864 /* allowParentScopeTraversal */) {
            flagNames.push('allowParentScopeTraversal');
        }
        if (flags & 1 /* getterSetterStrategy */) {
            flagNames.push('getterSetterStrategy');
        }
        if (flags & 2 /* proxyStrategy */) {
            flagNames.push('proxyStrategy');
        }
        if (flags & 1073741824 /* secondaryExpression */) {
            flagNames.push('secondaryExpression');
        }
        if (flagNames.length === 0) {
            return 'none';
        }
        return flagNames.join('|');
    }
    exports.stringifyLifecycleFlags = stringifyLifecycleFlags;
});
//# sourceMappingURL=tracer.js.map