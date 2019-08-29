(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultCssExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
    exports.defaultJsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.coffee'];
    exports.defaultTemplateExtensions = ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'];
    function preprocessOptions(options = {}) {
        const { cssExtensions = [], jsExtensions = [], templateExtensions = [], useCSSModule = false, stringModuleWrap, ...others } = options;
        return {
            cssExtensions: Array.from(new Set([...exports.defaultCssExtensions, ...cssExtensions])).sort(),
            jsExtensions: Array.from(new Set([...exports.defaultJsExtensions, ...jsExtensions])).sort(),
            templateExtensions: Array.from(new Set([...exports.defaultTemplateExtensions, ...templateExtensions])).sort(),
            stringModuleWrap: useCSSModule ? undefined : stringModuleWrap,
            ...others
        };
    }
    exports.preprocessOptions = preprocessOptions;
});
//# sourceMappingURL=options.js.map