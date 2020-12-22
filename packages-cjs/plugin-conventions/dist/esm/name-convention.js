import { camelCase, kebabCase } from '@aurelia/kernel';
export function nameConvention(className) {
    const m = /^(.+?)(CustomAttribute|ValueConverter|BindingBehavior|BindingCommand|TemplateController)?$/.exec(className);
    if (!m) {
        throw new Error(`No convention found for class name ${className}`);
    }
    const bareName = m[1];
    const type = (m[2] ? camelCase(m[2]) : 'customElement');
    return {
        name: normalizedName(bareName, type),
        type
    };
}
function normalizedName(name, type) {
    if (type === 'valueConverter' || type === 'bindingBehavior') {
        return camelCase(name);
    }
    return kebabCase(name);
}
//# sourceMappingURL=name-convention.js.map