import { preprocessResource } from './preprocess-resource';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import * as fs from 'fs';
import * as path from 'path';

export function preprocess(
  filePath: string,
  contents: string,
  ts: boolean = false,
  _fileExists = fileExists // for testing
) {
  const ext = path.extname(filePath);

  if (ext === '.html') {
    return preprocessHtmlTemplate(filePath, contents, ts);
  } else {
    const htmlFilePath = filePath.slice(0, - ext.length) + '.html';
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
