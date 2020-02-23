import { generateApiDoc, TemplateGenerator, ApiExtractor } from "./src";
import { environment } from './environment';
import { SourceFile } from 'ts-morph';

function excludeVeryLargeFilesHere(item: SourceFile) {

  var path = item.getFilePath();
  return true;

}

ApiExtractor.configure(configuration => {

  configuration.files.tsConfig = environment.tsConfigFile;

  configuration.files.excludes.push('aot/src/vm');

  configuration.files.filter.push(excludeVeryLargeFilesHere);

  return configuration;

});

generateApiDoc("./result");
