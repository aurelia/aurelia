import * as tslib_1 from "tslib";
import { bindable, customAttribute, INode, LifecycleTask } from '@aurelia/runtime';
import { I18N } from './i18n';
// TODO write unit tests
/**
 * `t` custom attribute to facilitate the translation via HTML
 * @export
 */
let TCustomAttribute = class TCustomAttribute {
    constructor(node, i18n) {
        this.node = node;
        this.i18n = i18n;
        this.value = (void 0);
    }
    binding(flags) {
        return this.isStringValue(this.value)
            ? this.i18n.updateValue(this.node, this.value)
            : LifecycleTask.done;
    }
    isStringValue(value) {
        const valueType = typeof value;
        if (valueType !== 'string') {
            throw new Error(`Only string value is supported by the localization attribute, found value of type ${valueType}`);
        }
        // skip translation if the value is null, undefined, or empty
        return !!value;
    }
};
tslib_1.__decorate([
    bindable
], TCustomAttribute.prototype, "value", void 0);
TCustomAttribute = tslib_1.__decorate([
    customAttribute({ name: 't' }),
    tslib_1.__param(0, INode),
    tslib_1.__param(1, I18N)
], TCustomAttribute);
export { TCustomAttribute };
//# sourceMappingURL=t-custom-attribute.js.map