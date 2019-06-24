import * as tslib_1 from "tslib";
import { bindable, customElement, valueConverter } from '@aurelia/runtime';
let SortValueConverter = class SortValueConverter {
    toView(arr, prop, dir = 'asc') {
        if (Array.isArray(arr)) {
            const factor = dir === 'asc' ? 1 : -1;
            if (prop && prop.length) {
                arr.sort((a, b) => a[prop] - b[prop] * factor);
            }
            else {
                arr.sort((a, b) => a - b * factor);
            }
        }
        return arr;
    }
};
SortValueConverter = tslib_1.__decorate([
    valueConverter('sort')
], SortValueConverter);
export { SortValueConverter };
let JsonValueConverter = class JsonValueConverter {
    toView(input) {
        return JSON.stringify(input);
    }
    fromView(input) {
        return JSON.parse(input);
    }
};
JsonValueConverter = tslib_1.__decorate([
    valueConverter('json')
], JsonValueConverter);
export { JsonValueConverter };
let NameTag = class NameTag {
};
tslib_1.__decorate([
    bindable()
], NameTag.prototype, "name", void 0);
NameTag = tslib_1.__decorate([
    customElement({
        name: 'name-tag',
        template: '<template>${name}</template>',
        build: { required: true, compiler: 'default' },
        dependencies: [],
        instructions: [],
        surrogates: []
    })
], NameTag);
const globalResources = [
    SortValueConverter,
    JsonValueConverter,
    NameTag
];
export const TestConfiguration = {
    register(container) {
        container.register(...globalResources);
    }
};
//# sourceMappingURL=resources.js.map