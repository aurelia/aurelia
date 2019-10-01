import { __decorate, __param } from "tslib";
import { IViewLocator } from '../../templating/view';
import { valueConverter } from '../value-converter';
let ViewValueConverter = class ViewValueConverter {
    constructor(viewLocator) {
        this.viewLocator = viewLocator;
    }
    toView(object, viewNameOrSelector) {
        return this.viewLocator.getViewComponentForObject(object, viewNameOrSelector);
    }
};
ViewValueConverter = __decorate([
    valueConverter('view'),
    __param(0, IViewLocator)
], ViewValueConverter);
export { ViewValueConverter };
//# sourceMappingURL=view.js.map