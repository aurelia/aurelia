export { nameConvention } from './name-convention';
export { resourceName } from './resource-name';
export { preprocessResource } from './preprocess-resource';
export { preprocessHtmlTemplate } from './preprocess-html-template';
export { stripMetaData } from './strip-meta-data';
export { preprocess } from './preprocess';
// export { precompileTemplate, generateCodeFromDefinition } from './pre-compile-template';
// export {
//   AttributeDefinition,
//   BindableInfo,
//   ElementDefinition,
//   IAuFileSystem,
//   ResourceDefinition,
//   ResourceIndex,
//   ResourceIndexer,
//   ResourceInfo,
//   ResourceInfoAttribute,
//   ResourceInfoElement,
//   AuFileSystem,
//   IAuProject,
//   IFile,
//   IFileGroup,
// } from './indexer';
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
