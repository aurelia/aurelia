export type ResourceType = 'customElement' | 'customAttribute' | 'valueConverter' | 'bindingBehavior' | 'bindingCommand' | 'templateController';

export interface INameConvention {
  name: string;
  type: ResourceType;
}

export interface IFileUnit {
  // The path is used in sourceMap.
  path: string;
  // The base path that file path is related to. Used for checking existence of the pair html.
  // We separated file path and base because file path will be written into source map.
  base?: string;
  contents: string;
  // For foo.js or foo.ts, this is foo.html or foo.md or foo.haml or foo.pug
  // For foo.html (or other templates), this is foo.css or foo.scss or foo.sass or foo.less or foo.styl
  filePair?: string;
  readFile?(path: string): string;
}

export interface IOptionalPreprocessOptions {
  defaultShadowOptions?: { mode: 'open' | 'closed' };
  // More details in ./preprocess-html-template.ts
  stringModuleWrap?: ((id: string) => string);
  cssExtensions?: string[]; // .css, .scss, .sass, .less, .styl
  jsExtensions?: string[]; // .js, .jsx, .ts, .tsx, .coffee
  templateExtensions?: string[]; // .html, .md, .pug, .haml, .jade, .slim, .slm
  // When foo.js is paired by foo.md,
  // when foo.md is paried by foo.scss,
  // most bundlers require import original filename foo.md and foo.scss
  // instead of foo.html and foo.css.
  // But some bundlers (dumber) require import processed filename foo.html
  // and foo.css.
  useProcessedFilePairFilename?: boolean;
  // Whenn CSSModule is in use, stringModuleWrap is ignored.
  useCSSModule?: boolean;
  hmr?: boolean;
  enableConventions?: boolean;
  hmrModule?: string;
  /**
   * Used to transform a html module import specifier into something else if necessary
   * Example: changing import `./app.html` ->  `./app.$au.ts`:
   *
   * ```
   * {
   *   transformHtmlImportSpecifier: specifier => specifier.replace('.html', '.$au.ts')
   * }
   * ```
   */
  transformHtmlImportSpecifier?: (specifier: string) => string;
  /**
   * This gets the generated HMR code for the specified class
   *
   * @param viewModelClassName - The name of the class to generate HMR code for
   * @param moduleName - the name of the module that triggers the hot reload
   */
  getHmrCode?: (viewModelClassName: string, moduleName?: string) => string;
  /**
   * Enables the type checking for template.
   * The type-checking is still a work in progress, and hence is experimental.
   */
  experimentalTemplateTypeCheck?: boolean;
}

export interface IPreprocessOptions {
  defaultShadowOptions?: { mode: 'open' | 'closed' };
  // More details in ./preprocess-html-template.ts
  stringModuleWrap?: ((id: string) => string);
  cssExtensions: string[]; // .css, .scss, .sass, .less, .styl
  jsExtensions: string[]; // .js, .jsx, .ts, .tsx, .coffee
  templateExtensions: string[]; // .html, .md, .pug, .haml, .jade, .slim, .slm
  useProcessedFilePairFilename?: boolean;
  useCSSModule: boolean;
  hmr?: boolean;
  enableConventions?: boolean;
  hmrModule?: string;
  /**
   * Used to transform a html module import specifier into something else if necessary
   * Example: changing import `./app.html` ->  `./app.$au.ts`:
   *
   * ```
   * {
   *   transformHtmlImportSpecifier: specifier => specifier.replace('.html', '.$au.ts')
   * }
   * ```
   */
  transformHtmlImportSpecifier?: (specifier: string) => string;
  /**
   * This gets the generated HMR code for the specified class
   *
   * @param viewModelClassName - The name of the class to generate HMR code for
   * @param moduleName - the name of the module that triggers the hot reload
   */
  getHmrCode?: (viewModelClassName: string, moduleName?: string) => string;
  /**
   * Enables the type checking for template.
   * The type-checking is still a work in progress, and hence is experimental.
   */
  experimentalTemplateTypeCheck: boolean;
}

export const defaultCssExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
export const defaultJsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.coffee'];
export const defaultTemplateExtensions = ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'];

export function preprocessOptions(options: IOptionalPreprocessOptions = {}): IPreprocessOptions {
  const {
    cssExtensions = [],
    jsExtensions = [],
    templateExtensions = [],
    useCSSModule = false,
    hmr = true,
    enableConventions = true,
    hmrModule = 'module',
    experimentalTemplateTypeCheck = false,
    ...others
  } = options;

  return {
    cssExtensions: Array.from(new Set([...defaultCssExtensions, ...cssExtensions])).sort(),
    jsExtensions: Array.from(new Set([...defaultJsExtensions, ...jsExtensions])).sort(),
    templateExtensions: Array.from(new Set([...defaultTemplateExtensions, ...templateExtensions])).sort(),
    useCSSModule,
    hmr,
    hmrModule,
    enableConventions,
    experimentalTemplateTypeCheck,
    ...others
  };
}
