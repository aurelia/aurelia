import { ApiExtractor, generateApiDoc, TemplateGenerator } from "./src";
import { IComment } from './src/api/models/comment/comment';
import { environment } from './environment';

const Stopwatch = require('statman-stopwatch');

const sw = new Stopwatch(true);

const FilterOutInternalElements = (element: IComment) => {

    if (element.comment === void 0)
        return true;
    if (element.comment.description === void 0)
        return true;

    const hasInternal = element.comment.description?.join(' ').includes('@internal');
    return !hasInternal;
}

ApiExtractor.configure(configuration => {
    configuration.classes = {
        filterElements: FilterOutInternalElements
    }
    configuration.interfaces = {
        filterElements: FilterOutInternalElements
    }
    return configuration;
});

TemplateGenerator.configure(configuration => {
    configuration.baseUrl = 'https://hamedfathi.gitbook.io/aurelia-2-doc-api/';
    return configuration;
});

console.log(environment.tsConfigFile);

let result = generateApiDoc(
    environment.tsConfigFile, "./result");
sw.stop();
const delta = ((sw.read() as number) / 1000).toString();
console.log(parseFloat(delta).toFixed(2) + 's');

const a = 1;
