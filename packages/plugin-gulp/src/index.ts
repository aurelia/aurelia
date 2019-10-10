import { Transform } from 'stream';
import { IOptionalPreprocessOptions, preprocess, preprocessOptions } from '@aurelia/plugin-conventions';
import * as Vinyl from 'vinyl';

export default function(options: IOptionalPreprocessOptions = {}) {
  return plugin({
    ...options,
    useProcessedFilePairFilename: true,
    stringModuleWrap
  });
}

export function plugin(
  options: IOptionalPreprocessOptions,
  _preprocess = preprocess // for testing
) {
  const allOptions = preprocessOptions(options);
  return new Transform({
    objectMode: true,
    transform: function(file: Vinyl, enc, cb) {
      if (file.isStream()) {
        this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
      } else if (file.isBuffer()) {
        // Rewrite foo.html to foo.html.js
        const result = _preprocess(
          {
            path: file.relative,
            contents: file.contents.toString(),
            base: file.base
          },
          allOptions
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
