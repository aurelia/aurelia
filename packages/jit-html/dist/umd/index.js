(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./binding-command", "./configuration", "./debugging", "./template-binder", "./template-element-factory"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var binding_command_1 = require("./binding-command");
    exports.TriggerBindingCommand = binding_command_1.TriggerBindingCommand;
    exports.DelegateBindingCommand = binding_command_1.DelegateBindingCommand;
    exports.CaptureBindingCommand = binding_command_1.CaptureBindingCommand;
    exports.AttrBindingCommand = binding_command_1.AttrBindingCommand;
    exports.ClassBindingCommand = binding_command_1.ClassBindingCommand;
    exports.StyleBindingCommand = binding_command_1.StyleBindingCommand;
    var configuration_1 = require("./configuration");
    exports.ITemplateCompilerRegistration = configuration_1.ITemplateCompilerRegistration;
    exports.ITemplateElementFactoryRegistration = configuration_1.ITemplateElementFactoryRegistration;
    exports.DefaultComponents = configuration_1.DefaultComponents;
    exports.TriggerBindingCommandRegistration = configuration_1.TriggerBindingCommandRegistration;
    exports.DelegateBindingCommandRegistration = configuration_1.DelegateBindingCommandRegistration;
    exports.CaptureBindingCommandRegistration = configuration_1.CaptureBindingCommandRegistration;
    exports.AttrBindingCommandRegistration = configuration_1.AttrBindingCommandRegistration;
    exports.ClassBindingCommandRegistration = configuration_1.ClassBindingCommandRegistration;
    exports.StyleBindingCommandRegistration = configuration_1.StyleBindingCommandRegistration;
    exports.DefaultBindingLanguage = configuration_1.DefaultBindingLanguage;
    exports.BasicConfiguration = configuration_1.BasicConfiguration;
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