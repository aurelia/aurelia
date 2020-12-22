"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttrSyntaxTransformer = exports.IAttrSyntaxTransformer = void 0;
const kernel_1 = require("@aurelia/kernel");
exports.IAttrSyntaxTransformer = kernel_1.DI
    .createInterface('IAttrSyntaxTransformer', x => x.singleton(AttrSyntaxTransformer));
class AttrSyntaxTransformer {
    constructor() {
        /**
         * @internal
         */
        this.fns = [];
    }
    /**
     * Add a given function to a list of fns that will be used
     * to check if `'bind'` command can be transformed to `'two-way'` command.
     *
     * If one of those functions in this lists returns true, the `'bind'` command
     * will be transformed into `'two-way'` command.
     *
     * The function will be called with 2 parameters:
     * - element: the element that the template compiler is currently working with
     * - property: the target property name
     */
    useTwoWay(fn) {
        this.fns.push(fn);
    }
    /**
     * @internal
     */
    transform(node, attrSyntax) {
        if (attrSyntax.command === 'bind' &&
            (
            // note: even though target could possibly be mapped to a different name
            // the final property name shouldn't affect the two way transformation
            // as they both should work with original source attribute name
            shouldDefaultToTwoWay(node, attrSyntax.target) ||
                this.fns.length > 0 && this.fns.some(fn => fn(node, attrSyntax.target)))) {
            attrSyntax.command = 'two-way';
        }
        attrSyntax.target = this.map(node.tagName, attrSyntax.target);
    }
    /**
     * todo: this should be in the form of a lookup. the following is not extensible
     *
     * @internal
     */
    map(tagName, attr) {
        switch (tagName) {
            case 'LABEL':
                switch (attr) {
                    case 'for':
                        return 'htmlFor';
                    default:
                        return attr;
                }
            case 'IMG':
                switch (attr) {
                    case 'usemap':
                        return 'useMap';
                    default:
                        return attr;
                }
            case 'INPUT':
                switch (attr) {
                    case 'maxlength':
                        return 'maxLength';
                    case 'minlength':
                        return 'minLength';
                    case 'formaction':
                        return 'formAction';
                    case 'formenctype':
                        return 'formEncType';
                    case 'formmethod':
                        return 'formMethod';
                    case 'formnovalidate':
                        return 'formNoValidate';
                    case 'formtarget':
                        return 'formTarget';
                    case 'inputmode':
                        return 'inputMode';
                    default:
                        return attr;
                }
            case 'TEXTAREA':
                switch (attr) {
                    case 'maxlength':
                        return 'maxLength';
                    default:
                        return attr;
                }
            case 'TD':
            case 'TH':
                switch (attr) {
                    case 'rowspan':
                        return 'rowSpan';
                    case 'colspan':
                        return 'colSpan';
                    default:
                        return attr;
                }
            default:
                switch (attr) {
                    case 'accesskey':
                        return 'accessKey';
                    case 'contenteditable':
                        return 'contentEditable';
                    case 'tabindex':
                        return 'tabIndex';
                    case 'textcontent':
                        return 'textContent';
                    case 'innerhtml':
                        return 'innerHTML';
                    case 'scrolltop':
                        return 'scrollTop';
                    case 'scrollleft':
                        return 'scrollLeft';
                    case 'readonly':
                        return 'readOnly';
                    default:
                        return attr;
                }
        }
    }
}
exports.AttrSyntaxTransformer = AttrSyntaxTransformer;
function shouldDefaultToTwoWay(element, attr) {
    switch (element.tagName) {
        case 'INPUT':
            switch (element.type) {
                case 'checkbox':
                case 'radio':
                    return attr === 'checked';
                default:
                    return attr === 'value' || attr === 'files';
            }
        case 'TEXTAREA':
        case 'SELECT':
            return attr === 'value';
        default:
            switch (attr) {
                case 'textcontent':
                case 'innerhtml':
                    return element.hasAttribute('contenteditable');
                case 'scrolltop':
                case 'scrollleft':
                    return true;
                default:
                    return false;
            }
    }
}
//# sourceMappingURL=attribute-syntax-transformer.js.map