import * as fs from 'fs';
import { ModifyCodeResult } from 'modify-code';
import * as path from 'path';
import { IFileUnit, IOptionalPreprocessOptions, preprocessOptions } from './options';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import { preprocessResource } from './preprocess-resource';

export function preprocess(
  unit: IFileUnit,
  options: IOptionalPreprocessOptions,
  _fileExists = fileExists
): ModifyCodeResult | undefined {
  const ext = path.extname(unit.path);
  const basename = path.basename(unit.path, ext);
  const allOptions = preprocessOptions(options);
  const base = unit.base || '';

  if (allOptions.templateExtensions.includes(ext)) {
    const possibleFilePair = allOptions.cssExtensions.map(e =>
      path.join(base, unit.path.slice(0, - ext.length) + e)
    );
    const filePair = possibleFilePair.find(_fileExists);
    if (filePair) {
      if (allOptions.useProcessedFilePairFilename) {
        unit.filePair = basename + '.css';
      } else {
        unit.filePair = path.basename(filePair);
      }
    }
    return preprocessHtmlTemplate(unit, allOptions);
  } else if (allOptions.jsExtensions.includes(ext)) {
    const possibleFilePair = allOptions.templateExtensions.map(e =>
      path.join(base, unit.path.slice(0, - ext.length) + e)
    );
    const filePair = possibleFilePair.find(_fileExists);
    if (filePair) {
      if (allOptions.useProcessedFilePairFilename) {
        unit.filePair = basename + '.html';
      } else {
        unit.filePair = path.basename(filePair);
      }
    }
    return preprocessResource(unit, allOptions);
  }
}

function fileExists(p: string): boolean {
  try {
    // tslint:disable-next-line:non-literal-fs-path
    const stats = fs.statSync(p);
    return stats.isFile();
  } catch (e) {
    return false;
  }
}
