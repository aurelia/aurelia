export class StyleAttributeAccessor {
    constructor(lifecycle, flags, obj) {
        this.lifecycle = lifecycle;
        this.obj = obj;
        this.currentValue = '';
        this.oldValue = '';
        this.styles = {};
        this.version = 0;
        this.hasChanges = false;
        this.priority = 12288 /* propagate */;
        this.persistentFlags = flags & 1610612751 /* targetObserverFlags */;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 536870912 /* noTargetObserverQueue */) {
            this.flushRAF(flags);
        }
        else if (this.persistentFlags !== 1073741824 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
        }
    }
    flushRAF(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const { currentValue } = this;
            this.oldValue = currentValue;
            const styles = this.styles;
            let style;
            let version = this.version;
            if (currentValue instanceof Object) {
                let value;
                for (style in currentValue) {
                    if (currentValue.hasOwnProperty(style)) {
                        value = currentValue[style];
                        style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                        styles[style] = version;
                        this.setProperty(style, value);
                    }
                }
            }
            else if (typeof currentValue === 'string') {
                const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                let pair;
                while ((pair = rx.exec(currentValue)) != null) {
                    style = pair[1];
                    if (!style) {
                        continue;
                    }
                    styles[style] = version;
                    this.setProperty(style, pair[2]);
                }
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!styles.hasOwnProperty(style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    }
    setProperty(style, value) {
        let priority = '';
        if (value != null && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
            priority = 'important';
            value = value.replace('!important', '');
        }
        this.obj.style.setProperty(style, value, priority);
    }
    bind(flags) {
        if (this.persistentFlags === 1073741824 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
        this.oldValue = this.currentValue = this.obj.style.cssText;
    }
    unbind(flags) {
        if (this.persistentFlags === 1073741824 /* persistentTargetObserverQueue */) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }
}
//# sourceMappingURL=style-attribute-accessor.js.map