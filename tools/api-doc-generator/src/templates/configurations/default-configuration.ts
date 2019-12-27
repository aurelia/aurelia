import { ITemplateConfiguration } from './template-configuration';
import { Nunjucks } from '../../utils';
import { typeMapper } from '../../helpers';

const defaultConfiguration: ITemplateConfiguration = {
    baseUrl: '',
    environment: Nunjucks,
    typeMapper: typeMapper
};

export { defaultConfiguration };
