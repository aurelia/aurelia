import * as tslib_1 from "tslib";
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
ViewValueConverter = tslib_1.__decorate([
    valueConverter('view'),
    tslib_1.__param(0, IViewLocator)
], ViewValueConverter);
export { ViewValueConverter };
//# sourceMappingURL=view.js.map