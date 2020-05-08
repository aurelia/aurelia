var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./di", "./functions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const di_1 = require("./di");
    const functions_1 = require("./functions");
    /**
     * Flags to enable/disable color usage in the logging output.
     */
    var ColorOptions;
    (function (ColorOptions) {
        /**
         * Do not use ASCII color codes in logging output.
         */
        ColorOptions[ColorOptions["noColors"] = 0] = "noColors";
        /**
         * Use ASCII color codes in logging output. By default, timestamps and the TRC and DBG prefix are colored grey. INF white, WRN yellow, and ERR and FTL red.
         */
        ColorOptions[ColorOptions["colors"] = 1] = "colors";
    })(ColorOptions = exports.ColorOptions || (exports.ColorOptions = {}));
    exports.ILogConfig = di_1.DI.createInterface('ILogConfig').withDefault(x => x.instance(new LogConfig(0 /* noColors */, 3 /* warn */)));
    exports.ISink = di_1.DI.createInterface('ISink').noDefault();
    exports.ILogEventFactory = di_1.DI.createInterface('ILogEventFactory').withDefault(x => x.singleton(DefaultLogEventFactory));
    exports.ILogger = di_1.DI.createInterface('ILogger').withDefault(x => x.singleton(DefaultLogger));
    exports.ILogScopes = di_1.DI.createInterface('ILogScope').noDefault();
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    exports.format = functions_1.toLookup({
        red(str) {
            return `\u001b[31m${str}\u001b[39m`;
        },
        green(str) {
            return `\u001b[32m${str}\u001b[39m`;
        },
        yellow(str) {
            return `\u001b[33m${str}\u001b[39m`;
        },
        blue(str) {
            return `\u001b[34m${str}\u001b[39m`;
        },
        magenta(str) {
            return `\u001b[35m${str}\u001b[39m`;
        },
        cyan(str) {
            return `\u001b[36m${str}\u001b[39m`;
        },
        white(str) {
            return `\u001b[37m${str}\u001b[39m`;
        },
        grey(str) {
            return `\u001b[90m${str}\u001b[39m`;
        },
    });
    class LogConfig {
        constructor(colorOptions, level) {
            this.colorOptions = colorOptions;
            this.level = level;
        }
    }
    exports.LogConfig = LogConfig;
    const getLogLevelString = (function () {
        const logLevelString = [
            functions_1.toLookup({
                TRC: 'TRC',
                DBG: 'DBG',
                INF: 'INF',
                WRN: 'WRN',
                ERR: 'ERR',
                FTL: 'FTL',
                QQQ: '???',
            }),
            functions_1.toLookup({
                TRC: exports.format.grey('TRC'),
                DBG: exports.format.grey('DBG'),
                INF: exports.format.white('INF'),
                WRN: exports.format.yellow('WRN'),
                ERR: exports.format.red('ERR'),
                FTL: exports.format.red('FTL'),
                QQQ: exports.format.grey('???'),
            }),
        ];
        return function (level, colorOptions) {
            if (level <= 0 /* trace */) {
                return logLevelString[colorOptions].TRC;
            }
            if (level <= 1 /* debug */) {
                return logLevelString[colorOptions].DBG;
            }
            if (level <= 2 /* info */) {
                return logLevelString[colorOptions].INF;
            }
            if (level <= 3 /* warn */) {
                return logLevelString[colorOptions].WRN;
            }
            if (level <= 4 /* error */) {
                return logLevelString[colorOptions].ERR;
            }
            if (level <= 5 /* fatal */) {
                return logLevelString[colorOptions].FTL;
            }
            return logLevelString[colorOptions].QQQ;
        };
    })();
    function getScopeString(scope, colorOptions) {
        if (colorOptions === 0 /* noColors */) {
            return scope.join('.');
        }
        // eslint-disable-next-line @typescript-eslint/unbound-method
        return scope.map(exports.format.cyan).join('.');
    }
    function getIsoString(timestamp, colorOptions) {
        if (colorOptions === 0 /* noColors */) {
            return new Date(timestamp).toISOString();
        }
        return exports.format.grey(new Date(timestamp).toISOString());
    }
    class DefaultLogEvent {
        constructor(severity, message, optionalParams, scope, colorOptions, timestamp) {
            this.severity = severity;
            this.message = message;
            this.optionalParams = optionalParams;
            this.scope = scope;
            this.colorOptions = colorOptions;
            this.timestamp = timestamp;
        }
        toString() {
            const { severity, message, scope, colorOptions, timestamp } = this;
            if (scope.length === 0) {
                return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)}] ${message}`;
            }
            return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)} ${getScopeString(scope, colorOptions)}] ${message}`;
        }
    }
    exports.DefaultLogEvent = DefaultLogEvent;
    let DefaultLogEventFactory = class DefaultLogEventFactory {
        constructor(config) {
            this.config = config;
        }
        createLogEvent(logger, level, message, optionalParams) {
            return new DefaultLogEvent(level, message, optionalParams, logger.scope, this.config.colorOptions, Date.now());
        }
    };
    DefaultLogEventFactory = __decorate([
        __param(0, exports.ILogConfig),
        __metadata("design:paramtypes", [Object])
    ], DefaultLogEventFactory);
    exports.DefaultLogEventFactory = DefaultLogEventFactory;
    class ConsoleSink {
        constructor($console) {
            this.emit = function emit(event) {
                const optionalParams = event.optionalParams;
                if (optionalParams === void 0 || optionalParams.length === 0) {
                    switch (event.severity) {
                        case 0 /* trace */:
                        case 1 /* debug */:
                            return $console.debug(event.toString());
                        case 2 /* info */:
                            return $console.info(event.toString());
                        case 3 /* warn */:
                            return $console.warn(event.toString());
                        case 4 /* error */:
                        case 5 /* fatal */:
                            return $console.error(event.toString());
                    }
                }
                else {
                    switch (event.severity) {
                        case 0 /* trace */:
                        case 1 /* debug */:
                            return $console.debug(event.toString(), ...optionalParams);
                        case 2 /* info */:
                            return $console.info(event.toString(), ...optionalParams);
                        case 3 /* warn */:
                            return $console.warn(event.toString(), ...optionalParams);
                        case 4 /* error */:
                        case 5 /* fatal */:
                            return $console.error(event.toString(), ...optionalParams);
                    }
                }
            };
        }
    }
    exports.ConsoleSink = ConsoleSink;
    let DefaultLogger = class DefaultLogger {
        constructor(config, factory, sinks, scope = [], parent = null) {
            this.config = config;
            this.factory = factory;
            this.sinks = sinks;
            this.scope = scope;
            this.scopedLoggers = Object.create(null);
            if (parent === null) {
                this.root = this;
                this.parent = this;
            }
            else {
                this.root = parent.root;
                this.parent = parent;
            }
            const sinksLen = sinks.length;
            let i = 0;
            const emit = (level, msgOrGetMsg, optionalParams) => {
                const message = typeof msgOrGetMsg === 'function' ? msgOrGetMsg() : msgOrGetMsg;
                const event = factory.createLogEvent(this, level, message, optionalParams);
                for (i = 0; i < sinksLen; ++i) {
                    sinks[i].emit(event);
                }
            };
            this.trace = function trace(messageOrGetMessage, ...optionalParams) {
                if (config.level <= 0 /* trace */) {
                    emit(0 /* trace */, messageOrGetMessage, optionalParams);
                }
            };
            this.debug = function debug(messageOrGetMessage, ...optionalParams) {
                if (config.level <= 1 /* debug */) {
                    emit(1 /* debug */, messageOrGetMessage, optionalParams);
                }
            };
            this.info = function info(messageOrGetMessage, ...optionalParams) {
                if (config.level <= 2 /* info */) {
                    emit(2 /* info */, messageOrGetMessage, optionalParams);
                }
            };
            this.warn = function warn(messageOrGetMessage, ...optionalParams) {
                if (config.level <= 3 /* warn */) {
                    emit(3 /* warn */, messageOrGetMessage, optionalParams);
                }
            };
            this.error = function error(messageOrGetMessage, ...optionalParams) {
                if (config.level <= 4 /* error */) {
                    emit(4 /* error */, messageOrGetMessage, optionalParams);
                }
            };
            this.fatal = function fatal(messageOrGetMessage, ...optionalParams) {
                if (config.level <= 5 /* fatal */) {
                    emit(5 /* fatal */, messageOrGetMessage, optionalParams);
                }
            };
        }
        scopeTo(name) {
            const scopedLoggers = this.scopedLoggers;
            let scopedLogger = scopedLoggers[name];
            if (scopedLogger === void 0) {
                scopedLogger = scopedLoggers[name] = new DefaultLogger(this.config, this.factory, this.sinks, this.scope.concat(name), this);
            }
            return scopedLogger;
        }
    };
    DefaultLogger = __decorate([
        __param(0, exports.ILogConfig),
        __param(1, exports.ILogEventFactory),
        __param(2, di_1.all(exports.ISink)),
        __param(3, di_1.optional(exports.ILogScopes)),
        __param(4, di_1.ignore),
        __metadata("design:paramtypes", [Object, Object, Array, Array, Object])
    ], DefaultLogger);
    exports.DefaultLogger = DefaultLogger;
    /**
     * A basic `ILogger` configuration that configures a single `console` sink based on provided options.
     *
     * NOTE: You *must* register the return value of `.create` with the container / au instance, not this `LoggerConfiguration` object itself.
     *
     * ```ts
     * // GOOD
     * container.register(LoggerConfiguration.create(console))
     * // GOOD
     * container.register(LoggerConfiguration.create(console, LogLevel.debug))
     * // GOOD
     * container.register(LoggerConfiguration.create({
     *   debug: PLATFORM.noop,
     *   info: PLATFORM.noop,
     *   warn: PLATFORM.noop,
     *   error: msg => {
     *     throw new Error(msg);
     *   }
     * }, LogLevel.debug))
     *
     * // BAD
     * container.register(LoggerConfiguration)
     * ```
     */
    exports.LoggerConfiguration = functions_1.toLookup({
        /**
         * @param $console - The `console` object to use. Can be the native `window.console` / `global.console`, but can also be a wrapper or mock that implements the same interface.
         * @param level - The global `LogLevel` to configure. Defaults to `warn` or higher.
         * @param colorOptions - Whether to use colors or not. Defaults to `noColors`. Colors are especially nice in nodejs environments but don't necessarily work (well) in all environments, such as browsers.
         */
        create($console, level = 3 /* warn */, colorOptions = 0 /* noColors */) {
            return functions_1.toLookup({
                register(container) {
                    return container.register(di_1.Registration.instance(exports.ILogConfig, new LogConfig(colorOptions, level)), di_1.Registration.instance(exports.ISink, new ConsoleSink($console)));
                },
            });
        },
    });
});
//# sourceMappingURL=logger.js.map