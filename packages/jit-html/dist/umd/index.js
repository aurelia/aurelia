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
    exports.IAttrSyntaxTransformer = attribute_syntax_transformer_1.IAttrSyntaxTransformer;
    var binding_commands_1 = require("./binding-commands");
    exports.TriggerBindingCommand = binding_commands_1.TriggerBindingCommand;
    exports.DelegateBindingCommand = binding_commands_1.DelegateBindingCommand;
    exports.CaptureBindingCommand = binding_commands_1.CaptureBindingCommand;
    exports.AttrBindingCommand = binding_commands_1.AttrBindingCommand;
    exports.ClassBindingCommand = binding_commands_1.ClassBindingCommand;
    exports.StyleBindingCommand = binding_commands_1.StyleBindingCommand;
    var configuration_1 = require("./configuration");
    exports.ITemplateCompilerRegistration = configuration_1.ITemplateCompilerRegistration;
    exports.ITemplateElementFactoryRegistration = configuration_1.ITemplateElementFactoryRegistration;
    exports.IAttrSyntaxTransformerRegistation = configuration_1.IAttrSyntaxTransformerRegistation;
    exports.DefaultComponents = configuration_1.DefaultComponents;
    exports.TriggerBindingCommandRegistration = configuration_1.TriggerBindingCommandRegistration;
    exports.DelegateBindingCommandRegistration = configuration_1.DelegateBindingCommandRegistration;
    exports.CaptureBindingCommandRegistration = configuration_1.CaptureBindingCommandRegistration;
    exports.AttrBindingCommandRegistration = configuration_1.AttrBindingCommandRegistration;
    exports.ClassBindingCommandRegistration = configuration_1.ClassBindingCommandRegistration;
    exports.StyleBindingCommandRegistration = configuration_1.StyleBindingCommandRegistration;
    exports.DefaultBindingLanguage = configuration_1.DefaultBindingLanguage;
    exports.JitHtmlConfiguration = configuration_1.JitHtmlConfiguration;
    var debugging_1 = require("./debugging");
    exports.stringifyDOM = debugging_1.stringifyDOM;
    exports.stringifyInstructions = debugging_1.stringifyInstructions;
    exports.stringifyTemplateDefinition = debugging_1.stringifyTemplateDefinition;
    var template_binder_1 = require("./template-binder");
    exports.TemplateBinder = template_binder_1.TemplateBinder;
    var template_element_factory_1 = require("./template-element-factory");
    exports.ITemplateElementFactory = template_element_factory_1.ITemplateElementFactory;
});
//# sourceMappingURL=index.js.map