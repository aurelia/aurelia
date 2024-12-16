import * as path from 'path';
import { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IOptionalPreprocessOptions, preprocessOptions } from './options';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import { preprocessResource } from './preprocess-resource';
import { fileExists, readFile } from './file-exists';

export function preprocess(
  unit: IFileUnit,
  options: IOptionalPreprocessOptions,
  // for testing
  _fileExists = fileExists,
  _readFile = readFile,
): ModifyCodeResult | undefined {
  const ext = path.extname(unit.path);
  const basename = path.basename(unit.path, ext);
  const allOptions = preprocessOptions(options);
  const templateExtensions = allOptions.templateExtensions;
  const useProcessedFilePairFilename = allOptions.useProcessedFilePairFilename;
  unit.readFile = (path) => _readFile(unit, path);

  if (allOptions.enableConventions && templateExtensions.includes(ext)) {
    for (const ce of allOptions.cssExtensions) {
      let filePair: string | null = `${basename}.module${ce}`;
      if (!_fileExists(unit, `./${filePair}`)) {
        filePair = `${basename}${ce}`;
        if (!_fileExists(unit, `./${filePair}`)) continue;
      }

      // Replace foo.scss with transpiled file name foo.css
      unit.filePair = useProcessedFilePairFilename ? `${path.basename(filePair, path.extname(filePair))}.css` : filePair;
      break;
    }

    return preprocessHtmlTemplate(
      unit,
      allOptions,
      allOptions.jsExtensions.some(e => _fileExists(unit, `./${basename}${e}`)),
      _fileExists
    );
  }
  if (allOptions.jsExtensions.includes(ext)) {
    for (const te of templateExtensions) {
      const filePair = `${basename}${te}`;
      if (!_fileExists(unit, `./${filePair}`)) continue;
      unit.filePair = useProcessedFilePairFilename ? `${basename}.html` : filePair;

      // Try foo.js and foo-view.html convention.
      // This convention is handled by @view(), not @customElement().
      for (const te of templateExtensions) {
        // Note that this is technically not a nested for-loop, as it is bound to run only once when the file pair is found. Complexity: m+n instead of m*n.
        const viewPair = `${basename}-view${te}`;
        if (!_fileExists(unit, `./${viewPair}`)) continue;
        unit.filePair = useProcessedFilePairFilename ? `${basename}-view.html` : viewPair;
        break;
      }
      break;
    }
    return preprocessResource(unit, allOptions);
  }
}
