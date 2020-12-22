"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameConvention = void 0;
const kernel_1 = require("@aurelia/kernel");
function nameConvention(className) {
    const m = /^(.+?)(CustomAttribute|ValueConverter|BindingBehavior|BindingCommand|TemplateController)?$/.exec(className);
    if (!m) {
        throw new Error(`No convention found for class name ${className}`);
    }
    const bareName = m[1];
    const type = (m[2] ? kernel_1.camelCase(m[2]) : 'customElement');
    return {
        name: normalizedName(bareName, type),
        type
    };
}
exports.nameConvention = nameConvention;
function normalizedName(name, type) {
    if (type === 'valueConverter' || type === 'bindingBehavior') {
        return kernel_1.camelCase(name);
    }
    return kernel_1.kebabCase(name);
}
//# sourceMappingURL=name-convention.js.map