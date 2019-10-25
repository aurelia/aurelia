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
    class ClassAttributeAccessor {
        constructor(scheduler, flags, obj) {
            this.scheduler = scheduler;
            this.obj = obj;
            this.currentValue = '';
            this.oldValue = '';
            this.doNotCache = true;
            this.nameIndex = {};
            this.version = 0;
            this.hasChanges = false;
            this.isActive = false;
            this.task = null;
            this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
                this.flushChanges(flags);
            }
            else if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */ && this.task === null) {
                this.task = this.scheduler.queueRenderTask(() => {
                    this.flushChanges(flags);
                    this.task = null;
                });
            }
        }
        flushChanges(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue, nameIndex } = this;
                let { version } = this;
                this.oldValue = currentValue;
                const classesToAdd = this.getClassesToAdd(currentValue);
                // Get strings split on a space not including empties
                if (classesToAdd.length > 0) {
                    this.addClassesAndUpdateIndex(classesToAdd);
                }
                this.version += 1;
                // First call to setValue?  We're done.
                if (version === 0) {
                    return;
                }
                // Remove classes from previous version.
                version -= 1;
                for (const name in nameIndex) {
                    if (!Object.prototype.hasOwnProperty.call(nameIndex, name) || nameIndex[name] !== version) {
                        continue;
                    }
                    // TODO: this has the side-effect that classes already present which are added again,
                    // will be removed if they're not present in the next update.
                    // Better would be do have some configurability for this behavior, allowing the user to
                    // decide whether initial classes always need to be kept, always removed, or something in between
                    this.obj.classList.remove(name);
                }
            }
        }
        bind(flags) {
            if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
                if (this.task !== null) {
                    this.task.cancel();
                }
                this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
            }
        }
        unbind(flags) {
            if (this.task !== null) {
                this.task.cancel();
                this.task = null;
            }
        }
        splitClassString(classString) {
            const matches = classString.match(/\S+/g);
            if (matches === null) {
                return kernel_1.PLATFORM.emptyArray;
            }
            return matches;
        }
        getClassesToAdd(object) {
            if (typeof object === 'string') {
                return this.splitClassString(object);
            }
            if (object instanceof Array) {
                const len = object.length;
                if (len > 0) {
                    const classes = [];
                    for (let i = 0; i < len; ++i) {
                        classes.push(...this.getClassesToAdd(object[i]));
                    }
                    return classes;
                }
                else {
                    return kernel_1.PLATFORM.emptyArray;
                }
            }
            else if (object instanceof Object) {
                const classes = [];
                for (const property in object) {
                    // Let non typical values also evaluate true so disable bool check
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, no-extra-boolean-cast
                    if (!!object[property]) {
                        // We must do this in case object property has a space in the name which results in two classes
                        if (property.includes(' ')) {
                            classes.push(...this.splitClassString(property));
                        }
                        else {
                            classes.push(property);
                        }
                    }
                }
                return classes;
            }
            return kernel_1.PLATFORM.emptyArray;
        }
        addClassesAndUpdateIndex(classes) {
            const node = this.obj;
            for (let i = 0, length = classes.length; i < length; i++) {
                const className = classes[i];
                if (!className.length) {
                    continue;
                }
                this.nameIndex[className] = this.version;
                node.classList.add(className);
            }
        }
    }
    exports.ClassAttributeAccessor = ClassAttributeAccessor;
});
//# sourceMappingURL=class-attribute-accessor.js.map