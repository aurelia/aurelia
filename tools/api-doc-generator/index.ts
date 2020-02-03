import { generateApiDoc, TemplateGenerator } from "./src";
import { environment } from './environment';



function XX ( rept?: number ){

console.log(!rept);

rept = 0;

console.log(!rept);
}

XX();

// TemplateGenerator.configure(configuration => {
//     configuration.files.tsConfig = environment.tsConfigFile;
//     return configuration;
// });

// generateApiDoc("./result");
