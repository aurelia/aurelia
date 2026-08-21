import { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IFileUnitHost, IOptionalPreprocessOptions, preprocessOptions } from './options';
import { preprocessHtmlTemplate } from './preprocess-html-template';
import { preprocessResource } from './preprocess-resource';
import { basename, extname } from './path-utils';

export function preprocess(
  unit: IFileUnit,
  options: IOptionalPreprocessOptions,
  host: IFileUnitHost,
): ModifyCodeResult | undefined {
  const ext = extname(unit.path);
  const fileName = basename(unit.path, ext);
  const allOptions = preprocessOptions(options);
  const templateExtensions = allOptions.templateExtensions;
  const useProcessedFilePairFilename = allOptions.useProcessedFilePairFilename;
  unit.readFile = path => host.readFile(unit, path);

  if (allOptions.enableConventions && templateExtensions.includes(ext)) {
    for (const ce of allOptions.cssExtensions) {
      let filePair: string | null = `${fileName}.module${ce}`;
      if (!host.fileExists(unit, `./${filePair}`)) {
        filePair = `${fileName}${ce}`;
        if (!host.fileExists(unit, `./${filePair}`)) continue;
      }

      // Replace foo.scss with transpiled file name foo.css
      unit.filePair = useProcessedFilePairFilename ? `${basename(filePair, extname(filePair))}.css` : filePair;
      break;
    }

    return preprocessHtmlTemplate(
      unit,
      allOptions,
      allOptions.jsExtensions.some(e => host.fileExists(unit, `./${fileName}${e}`)),
      host.fileExists.bind(host)
    );
  }
  if (allOptions.jsExtensions.includes(ext)) {
    for (const te of templateExtensions) {
      const filePair = `${fileName}${te}`;
      if (!host.fileExists(unit, `./${filePair}`)) continue;
      unit.filePair = useProcessedFilePairFilename ? `${fileName}.html` : filePair;

      // Try foo.js and foo-view.html convention.
      // This convention is handled by @view(), not @customElement().
      for (const te of templateExtensions) {
        // Note that this is technically not a nested for-loop, as it is bound to run only once when the file pair is found. Complexity: m+n instead of m*n.
        const viewPair = `${fileName}-view${te}`;
        if (!host.fileExists(unit, `./${viewPair}`)) continue;
        unit.filePair = useProcessedFilePairFilename ? `${fileName}-view.html` : viewPair;
        break;
      }
      break;
    }
    return preprocessResource(unit, allOptions);
  }
}
