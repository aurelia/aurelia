(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./attribute-syntax-transformer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const attribute_syntax_transformer_1 = require("./attribute-syntax-transformer");
    class HtmlAttrSyntaxTransformer {
        static register(container) {
            return kernel_1.Registration.singleton(attribute_syntax_transformer_1.IAttrSyntaxTransformer, this).register(container);
        }
        transform(node, attrSyntax) {
            if (attrSyntax.command === 'bind' && shouldDefaultToTwoWay(node, attrSyntax)) {
                attrSyntax.command = 'two-way';
            }
            attrSyntax.target = this.map(node.tagName, attrSyntax.target);
        }
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
    exports.HtmlAttrSyntaxTransformer = HtmlAttrSyntaxTransformer;
    function shouldDefaultToTwoWay(element, attr) {
        switch (element.tagName) {
            case 'INPUT':
                switch (element.type) {
                    case 'checkbox':
                    case 'radio':
                        return attr.target === 'checked';
                    default:
                        return attr.target === 'value' || attr.target === 'files';
                }
            case 'TEXTAREA':
            case 'SELECT':
                return attr.target === 'value';
            default:
                switch (attr.target) {
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
});
//# sourceMappingURL=html-attribute-syntax-transformer.js.map