"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassesToAdd = exports.ClassAttributeAccessor = void 0;
const kernel_1 = require("@aurelia/kernel");
class ClassAttributeAccessor {
    constructor(obj) {
        this.obj = obj;
        this.currentValue = '';
        this.oldValue = '';
        this.doNotCache = true;
        this.nameIndex = {};
        this.version = 0;
        this.hasChanges = false;
        this.isActive = false;
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 1024 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.currentValue;
            const nameIndex = this.nameIndex;
            let version = this.version;
            this.oldValue = currentValue;
            const classesToAdd = getClassesToAdd(currentValue);
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
    addClassesAndUpdateIndex(classes) {
        const node = this.obj;
        for (let i = 0, ii = classes.length; i < ii; i++) {
            const className = classes[i];
            if (className.length === 0) {
                continue;
            }
            this.nameIndex[className] = this.version;
            node.classList.add(className);
        }
    }
}
exports.ClassAttributeAccessor = ClassAttributeAccessor;
function getClassesToAdd(object) {
    if (typeof object === 'string') {
        return splitClassString(object);
    }
    if (typeof object !== 'object') {
        return kernel_1.emptyArray;
    }
    if (object instanceof Array) {
        const len = object.length;
        if (len > 0) {
            const classes = [];
            for (let i = 0; i < len; ++i) {
                classes.push(...getClassesToAdd(object[i]));
            }
            return classes;
        }
        else {
            return kernel_1.emptyArray;
        }
    }
    const classes = [];
    for (const property in object) {
        // Let non typical values also evaluate true so disable bool check
        if (Boolean(object[property])) {
            // We must do this in case object property has a space in the name which results in two classes
            if (property.includes(' ')) {
                classes.push(...splitClassString(property));
            }
            else {
                classes.push(property);
            }
        }
    }
    return classes;
}
exports.getClassesToAdd = getClassesToAdd;
function splitClassString(classString) {
    const matches = classString.match(/\S+/g);
    if (matches === null) {
        return kernel_1.emptyArray;
    }
    return matches;
}
//# sourceMappingURL=class-attribute-accessor.js.map