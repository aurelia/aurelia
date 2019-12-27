import { IApiConfiguration } from './configuration';
import { IApiExtractor } from './api-extractor';

const defaultConfiguration: IApiConfiguration = {};

let configuration: IApiConfiguration = defaultConfiguration;

const apiExtractor: IApiExtractor = {
    configure: (configureAction?: (defaultConfig: IApiConfiguration) => IApiConfiguration) => {
        configuration = configureAction
            ? configureAction(Object.assign({}, defaultConfiguration))
            : defaultConfiguration;
    },
    reset: () => {
        configuration = defaultConfiguration;
    },
};

export {
    apiExtractor as ApiExtractor, configuration as ApiConfiguration,
    IApiExtractor, IApiConfiguration
};
