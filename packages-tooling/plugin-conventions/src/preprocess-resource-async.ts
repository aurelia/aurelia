import { type ModifyCodeResult } from 'modify-code';
import { IFileUnit, IPreprocessOptions } from './options';
import { preprocessResource } from './preprocess-resource';

export async function preprocessResourceAsync(unit: IFileUnit, options: IPreprocessOptions): Promise<ModifyCodeResult> {
  if (options.experimentalTemplateTypeCheck) {
    throw new Error('experimentalTemplateTypeCheck is not supported by preprocessAsync. Use preprocess instead.');
  }

  const originalReadFile = unit.readFile;
  if (unit.readFile == null && unit.readFileAsync != null) {
    unit.readFile = (path: string) => {
      throw new Error(`Synchronous template reads are unavailable for '${path}'. Use preprocess instead.`);
    };
  }
  try {
    return preprocessResource(unit, options);
  } finally {
    unit.readFile = originalReadFile;
  }
}
