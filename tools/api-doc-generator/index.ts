import { generateApiDoc, TemplateGenerator } from "./src";
import { environment } from './environment';

TemplateGenerator.configure(configuration => {
    configuration.files.tsConfig = environment.tsConfigFile;
    return configuration;
});

generateApiDoc("./result");
