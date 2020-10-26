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
    exports.StyleAttributeAccessor = void 0;
    const kernel_1 = require("@aurelia/kernel");
    class StyleAttributeAccessor {
        constructor(flags, obj) {
            this.currentValue = '';
            this.oldValue = '';
            this.styles = {};
            this.version = 0;
            this.hasChanges = false;
            this.task = null;
            this.type = 2 /* Node */ | 64 /* Layout */;
            this.obj = obj;
            this.persistentFlags = flags & 12295 /* targetObserverFlags */;
        }
        getValue() {
            return this.obj.style.cssText;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* noTargetObserverQueue */) === 0) {
                this.flushChanges(flags);
            }
        }
        getStyleTuplesFromString(currentValue) {
            const styleTuples = [];
            const rx = /\s*([\w-]+)\s*:\s*((?:(?:[\w-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^)]*)\),?|[^)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
            let pair;
            let name;
            while ((pair = rx.exec(currentValue)) !== null) {
                name = pair[1];
                if (name.length === 0) {
                    continue;
                }
                styleTuples.push([name, pair[2]]);
            }
            return styleTuples;
        }
        getStyleTuplesFromObject(currentValue) {
            let value;
            const styles = [];
            for (const property in currentValue) {
                value = currentValue[property];
                if (value == null) {
                    continue;
                }
                if (typeof value === 'string') {
                    styles.push([kernel_1.kebabCase(property), value]);
                    continue;
                }
                styles.push(...this.getStyleTuples(value));
            }
            return styles;
        }
        getStyleTuplesFromArray(currentValue) {
            const len = currentValue.length;
            if (len > 0) {
                const styles = [];
                for (let i = 0; i < len; ++i) {
                    styles.push(...this.getStyleTuples(currentValue[i]));
                }
                return styles;
            }
            return kernel_1.emptyArray;
        }
        getStyleTuples(currentValue) {
            if (typeof currentValue === 'string') {
                return this.getStyleTuplesFromString(currentValue);
            }
            if (currentValue instanceof Array) {
                return this.getStyleTuplesFromArray(currentValue);
            }
            if (currentValue instanceof Object) {
                return this.getStyleTuplesFromObject(currentValue);
            }
            return kernel_1.emptyArray;
        }
        flushChanges(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const currentValue = this.currentValue;
                const styles = this.styles;
                const styleTuples = this.getStyleTuples(currentValue);
                let style;
                let version = this.version;
                this.oldValue = currentValue;
                let tuple;
                let name;
                let value;
                const len = styleTuples.length;
                for (let i = 0; i < len; ++i) {
                    tuple = styleTuples[i];
                    name = tuple[0];
                    value = tuple[1];
                    this.setProperty(name, value);
                    styles[name] = version;
                }
                this.styles = styles;
                this.version += 1;
                if (version === 0) {
                    return;
                }
                version -= 1;
                for (style in styles) {
                    if (!Object.prototype.hasOwnProperty.call(styles, style) || styles[style] !== version) {
                        continue;
                    }
                    this.obj.style.removeProperty(style);
                }
            }
        }
        setProperty(style, value) {
            let priority = '';
            if (value != null && typeof value.indexOf === 'function' && value.includes('!important')) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.obj.style.setProperty(style, value, priority);
        }
        bind(flags) {
            this.currentValue = this.oldValue = this.obj.style.cssText;
        }
    }
    exports.StyleAttributeAccessor = StyleAttributeAccessor;
});
//# sourceMappingURL=style-attribute-accessor.js.map