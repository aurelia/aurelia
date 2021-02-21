import { camelCase, DI } from '@aurelia/kernel';
import { createLookup, isDataAttribute } from './utilities-html.js';
import { ISVGAnalyzer } from './observation/svg-analyzer.js';
export const IAttrSyntaxTransformer = DI
    .createInterface('IAttrSyntaxTransformer', x => x.singleton(AttrSyntaxTransformer));
export class AttrSyntaxTransformer {
    constructor(svg) {
        this.svg = svg;
        /**
         * @internal
         */
        this.fns = [];
        /**
         * @internal
         */
        this.tagAttrMap = createLookup();
        /**
         * @internal
         */
        this.globalAttrMap = createLookup();
        this.useMapping({
            LABEL: { for: 'htmlFor' },
            IMG: { usemap: 'useMap' },
            INPUT: {
                maxlength: 'maxLength',
                minlength: 'minLength',
                formaction: 'formAction',
                formenctype: 'formEncType',
                formmethod: 'formMethod',
                formnovalidate: 'formNoValidate',
                formtarget: 'formTarget',
                inputmode: 'inputMode',
            },
            TEXTAREA: { maxlength: 'maxLength' },
            TD: { rowspan: 'rowSpan', colspan: 'colSpan' },
            TH: { rowspan: 'rowSpan', colspan: 'colSpan' },
        });
        this.useGlobalMapping({
            accesskey: 'accessKey',
            contenteditable: 'contentEditable',
            tabindex: 'tabIndex',
            textcontent: 'textContent',
            innerhtml: 'innerHTML',
            scrolltop: 'scrollTop',
            scrollleft: 'scrollLeft',
            readonly: 'readOnly',
        });
    }
    static get inject() { return [ISVGAnalyzer]; }
    /**
     * Allow application to teach Aurelia how to define how to map attributes to properties
     * based on element tagName
     */
    useMapping(config) {
        var _a;
        var _b;
        let newAttrMapping;
        let targetAttrMapping;
        let tagName;
        let attr;
        for (tagName in config) {
            newAttrMapping = config[tagName];
            targetAttrMapping = (_a = (_b = this.tagAttrMap)[tagName]) !== null && _a !== void 0 ? _a : (_b[tagName] = createLookup());
            for (attr in newAttrMapping) {
                if (targetAttrMapping[attr] !== void 0) {
                    throw createMappedError(attr, tagName);
                }
                targetAttrMapping[attr] = newAttrMapping[attr];
            }
        }
    }
    /**
     * Allow applications to teach Aurelia how to define how to map attributes to properties
     * for all elements
     */
    useGlobalMapping(config) {
        const mapper = this.globalAttrMap;
        for (const attr in config) {
            if (mapper[attr] !== void 0) {
                throw createMappedError(attr, '*');
            }
            mapper[attr] = config[attr];
        }
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
        var _a, _b, _c;
        if (attrSyntax.command === 'bind' &&
            (
            // note: even though target could possibly be mapped to a different name
            // the final property name shouldn't affect the two way transformation
            // as they both should work with original source attribute name
            shouldDefaultToTwoWay(node, attrSyntax.target) ||
                this.fns.length > 0 && this.fns.some(fn => fn(node, attrSyntax.target)))) {
            attrSyntax.command = 'two-way';
        }
        const attr = attrSyntax.target;
        attrSyntax.target = (_c = (_b = (_a = this.tagAttrMap[node.tagName]) === null || _a === void 0 ? void 0 : _a[attr]) !== null && _b !== void 0 ? _b : this.globalAttrMap[attr]) !== null && _c !== void 0 ? _c : (isDataAttribute(node, attr, this.svg)
            ? attr
            : camelCase(attr));
        // attrSyntax.target = this.map(node.tagName, attrSyntax.target);
    }
}
function shouldDefaultToTwoWay(element, attr) {
    switch (element.tagName) {
        case 'INPUT':
            switch (element.type) {
                case 'checkbox':
                case 'radio':
                    return attr === 'checked';
                // note:
                // ideally, it should check for corresponding input type first
                // as 'files' shouldn't be two way on a number input, for example
                // but doing it this way is acceptable-ish, as the common user expectations,
                // and the behavior of the control for these properties are the same,
                // regardless the type of the <input>
                default:
                    return attr === 'value' || attr === 'files' || attr === 'value-as-number' || attr === 'value-as-date';
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
function createMappedError(attr, tagName) {
    return new Error(`Attribute ${attr} has been already registered for ${tagName === '*' ? 'all elements' : `<${tagName}/>`}`);
}
//# sourceMappingURL=attribute-syntax-transformer.js.map