(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./attribute-syntax-transformer", "./binding-commands", "./configuration", "./debugging", "./template-binder", "./template-element-factory"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var attribute_syntax_transformer_1 = require("./attribute-syntax-transformer");
    Object.defineProperty(exports, "IAttrSyntaxTransformer", { enumerable: true, get: function () { return attribute_syntax_transformer_1.IAttrSyntaxTransformer; } });
    var binding_commands_1 = require("./binding-commands");
    Object.defineProperty(exports, "TriggerBindingCommand", { enumerable: true, get: function () { return binding_commands_1.TriggerBindingCommand; } });
    Object.defineProperty(exports, "DelegateBindingCommand", { enumerable: true, get: function () { return binding_commands_1.DelegateBindingCommand; } });
    Object.defineProperty(exports, "CaptureBindingCommand", { enumerable: true, get: function () { return binding_commands_1.CaptureBindingCommand; } });
    Object.defineProperty(exports, "AttrBindingCommand", { enumerable: true, get: function () { return binding_commands_1.AttrBindingCommand; } });
    Object.defineProperty(exports, "ClassBindingCommand", { enumerable: true, get: function () { return binding_commands_1.ClassBindingCommand; } });
    Object.defineProperty(exports, "StyleBindingCommand", { enumerable: true, get: function () { return binding_commands_1.StyleBindingCommand; } });
    var configuration_1 = require("./configuration");
    Object.defineProperty(exports, "ITemplateCompilerRegistration", { enumerable: true, get: function () { return configuration_1.ITemplateCompilerRegistration; } });
    Object.defineProperty(exports, "ITemplateElementFactoryRegistration", { enumerable: true, get: function () { return configuration_1.ITemplateElementFactoryRegistration; } });
    Object.defineProperty(exports, "IAttrSyntaxTransformerRegistation", { enumerable: true, get: function () { return configuration_1.IAttrSyntaxTransformerRegistation; } });
    Object.defineProperty(exports, "DefaultComponents", { enumerable: true, get: function () { return configuration_1.DefaultComponents; } });
    Object.defineProperty(exports, "TriggerBindingCommandRegistration", { enumerable: true, get: function () { return configuration_1.TriggerBindingCommandRegistration; } });
    Object.defineProperty(exports, "DelegateBindingCommandRegistration", { enumerable: true, get: function () { return configuration_1.DelegateBindingCommandRegistration; } });
    Object.defineProperty(exports, "CaptureBindingCommandRegistration", { enumerable: true, get: function () { return configuration_1.CaptureBindingCommandRegistration; } });
    Object.defineProperty(exports, "AttrBindingCommandRegistration", { enumerable: true, get: function () { return configuration_1.AttrBindingCommandRegistration; } });
    Object.defineProperty(exports, "ClassBindingCommandRegistration", { enumerable: true, get: function () { return configuration_1.ClassBindingCommandRegistration; } });
    Object.defineProperty(exports, "StyleBindingCommandRegistration", { enumerable: true, get: function () { return configuration_1.StyleBindingCommandRegistration; } });
    Object.defineProperty(exports, "DefaultBindingLanguage", { enumerable: true, get: function () { return configuration_1.DefaultBindingLanguage; } });
    Object.defineProperty(exports, "JitHtmlConfiguration", { enumerable: true, get: function () { return configuration_1.JitHtmlConfiguration; } });
    var debugging_1 = require("./debugging");
    Object.defineProperty(exports, "stringifyDOM", { enumerable: true, get: function () { return debugging_1.stringifyDOM; } });
    Object.defineProperty(exports, "stringifyInstructions", { enumerable: true, get: function () { return debugging_1.stringifyInstructions; } });
    Object.defineProperty(exports, "stringifyTemplateDefinition", { enumerable: true, get: function () { return debugging_1.stringifyTemplateDefinition; } });
    var template_binder_1 = require("./template-binder");
    Object.defineProperty(exports, "TemplateBinder", { enumerable: true, get: function () { return template_binder_1.TemplateBinder; } });
    var template_element_factory_1 = require("./template-element-factory");
    Object.defineProperty(exports, "ITemplateElementFactory", { enumerable: true, get: function () { return template_element_factory_1.ITemplateElementFactory; } });
});
//# sourceMappingURL=index.js.map