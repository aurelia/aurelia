"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessOptions = exports.defaultTemplateExtensions = exports.defaultJsExtensions = exports.defaultCssExtensions = void 0;
exports.defaultCssExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
exports.defaultJsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.coffee'];
exports.defaultTemplateExtensions = ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'];
function preprocessOptions(options = {}) {
    const { cssExtensions = [], jsExtensions = [], templateExtensions = [], useCSSModule = false, ...others } = options;
    return {
        cssExtensions: Array.from(new Set([...exports.defaultCssExtensions, ...cssExtensions])).sort(),
        jsExtensions: Array.from(new Set([...exports.defaultJsExtensions, ...jsExtensions])).sort(),
        templateExtensions: Array.from(new Set([...exports.defaultTemplateExtensions, ...templateExtensions])).sort(),
        useCSSModule,
        ...others
    };
}
exports.preprocessOptions = preprocessOptions;
//# sourceMappingURL=options.js.map