import { PLATFORM } from '@aurelia/kernel';
export class ClassAttributeAccessor {
    constructor(lifecycle, flags, obj) {
        this.lifecycle = lifecycle;
        this.obj = obj;
        this.currentValue = '';
        this.oldValue = '';
        this.doNotCache = true;
        this.nameIndex = {};
        this.version = 0;
        this.isActive = false;
        this.hasChanges = false;
        this.priority = 12288 /* propagate */;
        this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            this.flushRAF(flags);
        }
        else if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
        }
    }
    flushRAF(flags) {
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
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
    }
    unbind(flags) {
        if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }
    splitClassString(classString) {
        const matches = classString.match(/\S+/g);
        if (matches === null) {
            return PLATFORM.emptyArray;
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
                return PLATFORM.emptyArray;
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
        return PLATFORM.emptyArray;
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
//# sourceMappingURL=class-attribute-accessor.js.map