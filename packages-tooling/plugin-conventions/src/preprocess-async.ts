import { ModifyCodeResult } from 'modify-code';
import { IFileUnit, IFileUnitHostAsync, IOptionalPreprocessOptions, preprocessOptions } from './options';
import { preprocessHtmlTemplateAsync } from './preprocess-html-template-async';
import { preprocessResourceAsync } from './preprocess-resource-async';
import { basename, extname } from './path-utils';

export async function preprocessAsync(
  unit: IFileUnit,
  options: IOptionalPreprocessOptions,
  host: IFileUnitHostAsync,
): Promise<ModifyCodeResult | undefined> {
  const ext = extname(unit.path);
  const fileName = basename(unit.path, ext);
  const allOptions = preprocessOptions(options);
  const templateExtensions = allOptions.templateExtensions;
  const useProcessedFilePairFilename = allOptions.useProcessedFilePairFilename;
  unit.readFileAsync = path => host.readFile(unit, path);

  if (allOptions.enableConventions && templateExtensions.includes(ext)) {
    for (const ce of allOptions.cssExtensions) {
      let filePair: string | null = `${fileName}.module${ce}`;
      if (!await host.fileExists(unit, `./${filePair}`)) {
        filePair = `${fileName}${ce}`;
        if (!await host.fileExists(unit, `./${filePair}`)) continue;
      }

      unit.filePair = useProcessedFilePairFilename ? `${basename(filePair, extname(filePair))}.css` : filePair;
      break;
    }

    let hasViewModel = false;
    for (const extension of allOptions.jsExtensions) {
      if (await host.fileExists(unit, `./${fileName}${extension}`)) {
        hasViewModel = true;
        break;
      }
    }

    return preprocessHtmlTemplateAsync(
      unit,
      allOptions,
      hasViewModel,
      host.fileExists.bind(host)
    );
  }
  if (allOptions.jsExtensions.includes(ext)) {
    for (const te of templateExtensions) {
      const filePair = `${fileName}${te}`;
      if (!await host.fileExists(unit, `./${filePair}`)) continue;
      unit.filePair = useProcessedFilePairFilename ? `${fileName}.html` : filePair;

      for (const templateExtension of templateExtensions) {
        const viewPair = `${fileName}-view${templateExtension}`;
        if (!await host.fileExists(unit, `./${viewPair}`)) continue;
        unit.filePair = useProcessedFilePairFilename ? `${fileName}-view.html` : viewPair;
        break;
      }
      break;
    }
    return preprocessResourceAsync(unit, allOptions);
  }
}
