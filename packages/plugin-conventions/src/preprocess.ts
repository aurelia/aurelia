import { preprocessResource } from './preprocess-resource';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import * as fs from 'fs';
import * as path from 'path';

export function preprocess(
  // The filePath is used in sourceMap.
  filePath: string,
  contents: string,
  // The base file path that filePath is related to. Used for checking existence of html pair.
  // We separated filePath and basePath because filePath will be written into source map.
  basePath: string = '',
  defaultShadowOptions: { mode: 'open' | 'closed' } | null = null,
  // More details in ./preprocess-html-template.ts
  stringModuleWrap: ((id: string) => string) | null = null,
  // For testing
  _fileExists = fileExists
) {
  const ext = path.extname(filePath);

  if (ext === '.html') {
    return preprocessHtmlTemplate(filePath, contents, defaultShadowOptions || undefined, stringModuleWrap || undefined);
  } else {
    const htmlFilePath = path.join(basePath, filePath.slice(0, - ext.length) + '.html');
    const hasHtmlPair = _fileExists(htmlFilePath);
    return preprocessResource(filePath, contents, hasHtmlPair);
  }
}

function fileExists(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (e) {
    return false;
  }
}
