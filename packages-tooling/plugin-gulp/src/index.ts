import { Transform } from 'stream';
import { IOptionalPreprocessOptions, preprocessAsync, preprocessOptions } from '@aurelia/plugin-conventions';
import { nodeFileUnitHostAsync } from '@aurelia/plugin-conventions/node';
import * as Vinyl from 'vinyl';

export default function (options: IOptionalPreprocessOptions = {}) {
  return plugin({
    ...options,
    isDev: process.env.NODE_ENV !== 'production',
    useProcessedFilePairFilename: true,
    stringModuleWrap
  });
}

export function plugin(
  options: IOptionalPreprocessOptions,
  _preprocess = preprocessAsync // for testing
) {
  const allOptions = preprocessOptions(options);
  return new Transform({
    objectMode: true,
    transform: async function (file: Vinyl, enc, cb) {
      if (file.isStream()) {
        this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
      } else if (file.isBuffer()) {
        // Rewrite foo.html to foo.html.js
        const result = await _preprocess(
          {
            path: file.relative,
            contents: file.contents.toString(),
            base: file.base
          },
          allOptions,
          nodeFileUnitHostAsync
        );

        if (result) {
          if (allOptions.templateExtensions.includes(file.extname)) {
            // Rewrite foo.html to foo.html.js, or foo.md to foo.md.js
            file.basename += '.js';
          }

          file.contents = Buffer.from(result.code);
          if (file.sourceMap) {
            // ignore existing source map for now
            file.sourceMap = result.map;
          }
        }
      }
      cb(undefined, file);
    }
  });
}

function stringModuleWrap(id: string) {
  return `text!${id}`;
}
