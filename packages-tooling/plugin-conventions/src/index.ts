export { nameConvention } from './name-convention';
export { resourceName } from './resource-name';
export {
  preprocessResource,
  type MethodArgument,
  type ClassMember,
  type ClassMetadata
} from './preprocess-resource';
export { preprocessHtmlTemplate } from './preprocess-html-template';
export { stripMetaData } from './strip-meta-data';
export { preprocess } from './preprocess';
export { createTypeCheckedTemplate } from './template-typechecking';
export {
  type INameConvention,
  type IFileUnit,
  type IOptionalPreprocessOptions,
  type IPreprocessOptions,
  defaultCssExtensions,
  defaultJsExtensions,
  defaultTemplateExtensions,
  preprocessOptions,
  type ResourceType
} from './options';
