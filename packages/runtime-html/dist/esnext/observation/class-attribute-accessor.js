export class ClassAttributeAccessor {
    constructor(lifecycle, obj) {
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
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* fromBind */) > 0) {
            this.flushRAF(flags);
        }
    }
    flushRAF(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const { currentValue, nameIndex } = this;
            let { version } = this;
            this.oldValue = currentValue;
            let names;
            let name;
            // Add the classes, tracking the version at which they were added.
            if (currentValue.length) {
                const node = this.obj;
                names = currentValue.split(/\s+/);
                for (let i = 0, length = names.length; i < length; i++) {
                    name = names[i];
                    if (!name.length) {
                        continue;
                    }
                    nameIndex[name] = version;
                    node.classList.add(name);
                }
            }
            // Update state variables.
            this.nameIndex = nameIndex;
            this.version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (name in nameIndex) {
                if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
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
        this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
    }
    unbind(flags) {
        this.lifecycle.dequeueRAF(this.flushRAF, this);
    }
}
//# sourceMappingURL=class-attribute-accessor.js.map