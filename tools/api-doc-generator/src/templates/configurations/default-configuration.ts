import { ITemplateConfiguration } from './template-configuration';
import { Nunjucks } from '../../utils';
import { typeMapper } from '../../helpers';
import { SourceFile } from 'ts-morph';

function notADeclarationFile(item:SourceFile){
  return !item.isDeclarationFile();
}

const defaultConfiguration: ITemplateConfiguration = {
  files: {
    tsConfig: '',
    excludes: [
      '__tests__',
      '__e2e__',
      'node_modules',
      'dist'
    ], filter: [ notADeclarationFile   ]
  },
  environment: Nunjucks,
  typeMapper: typeMapper
};

export { defaultConfiguration };
