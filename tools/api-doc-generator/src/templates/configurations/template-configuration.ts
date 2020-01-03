import { TypeInfo } from '../../Api/models/type/type-info';
import * as nj from 'nunjucks';
import { AlternativeTagsName } from '../models/alternative-tags-name';
import { SourceFile } from 'ts-morph';

export interface ITemplateConfiguration {
  files: {
    tsConfig: string,
    excludes: string[],
    filters: Array<(item: SourceFile) => boolean>;
  }
  baseUrl: string;
  typeMapper: (typeInfo: TypeInfo) => string;
  appendComments?: boolean;
  environment: nj.Environment;
  alterTags?: AlternativeTagsName[];
}
