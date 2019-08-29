export const defaultCssExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
export const defaultJsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.coffee'];
export const defaultTemplateExtensions = ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'];
export function preprocessOptions(options = {}) {
    const { cssExtensions = [], jsExtensions = [], templateExtensions = [], useCSSModule = false, stringModuleWrap, ...others } = options;
    return {
        cssExtensions: Array.from(new Set([...defaultCssExtensions, ...cssExtensions])).sort(),
        jsExtensions: Array.from(new Set([...defaultJsExtensions, ...jsExtensions])).sort(),
        templateExtensions: Array.from(new Set([...defaultTemplateExtensions, ...templateExtensions])).sort(),
        stringModuleWrap: useCSSModule ? undefined : stringModuleWrap,
        ...others
    };
}
//# sourceMappingURL=options.js.map