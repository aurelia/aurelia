import * as path from 'path';
import { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IOptionalPreprocessOptions, preprocessOptions } from './options';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import { preprocessResource } from './preprocess-resource';
import { fileExists } from './file-exists';

export function preprocess(
  unit: IFileUnit,
  options: IOptionalPreprocessOptions,
  _fileExists = fileExists
): ModifyCodeResult | undefined {
  const ext = path.extname(unit.path);
  const basename = path.basename(unit.path, ext);
  const allOptions = preprocessOptions(options);

  if (allOptions.enableConventions && allOptions.templateExtensions.includes(ext)) {
    const possibleFilePair = allOptions.cssExtensions.map(e =>
      `${basename}${e}`
    );

    const filePair = possibleFilePair.find(p => _fileExists(unit, `./${p}`));
    if (filePair) {
      if (allOptions.useProcessedFilePairFilename) {
        unit.filePair = `${basename}.css`;
      } else {
        unit.filePair = filePair;
      }
    }

    const hasViewModel = Boolean(allOptions.jsExtensions.map(e =>
      `${basename}${e}`
    ).find(p => _fileExists(unit, `./${p}`)));

    return preprocessHtmlTemplate(unit, allOptions, hasViewModel, _fileExists);
  } else if (allOptions.jsExtensions.includes(ext)) {
    const possibleFilePair = allOptions.templateExtensions.map(e =>
      `${basename}${e}`
    );
    const filePair = possibleFilePair.find(p => _fileExists(unit, `./${p}`));
    if (filePair) {
      if (allOptions.useProcessedFilePairFilename) {
        unit.filePair = `${basename}.html`;
      } else {
        unit.filePair = filePair;
      }
    } else {
      // Try foo.js and foo-view.html convention.
      // This convention is handled by @view(), not @customElement().
      const possibleViewPair = allOptions.templateExtensions.map(e =>
        `${basename}-view${e}`
      );
      const viewPair = possibleViewPair.find(p => _fileExists(unit, `./${p}`));
      if (viewPair) {
        unit.isViewPair = true;
        if (allOptions.useProcessedFilePairFilename) {
          unit.filePair = `${basename}-view.html`;
        } else {
          unit.filePair = viewPair;
        }
      }
    }
    return preprocessResource(unit, allOptions);
  }
}

