import { Transform } from 'stream';
import * as Vinyl from 'vinyl';
import { preprocess } from '@aurelia/plugin-conventions';

export default function(options: any = {}) {
  let shadowOptions;
  let useCSSModule = false;
  if (options && options.defaultShadowOptions) {
    shadowOptions = options.defaultShadowOptions as { mode: 'open' | 'closed' };
  }
  if (options && options.useCSSModule) {
    useCSSModule = options.useCSSModule;
  }
  return plugin(shadowOptions, useCSSModule);
}

export function plugin(
  shadowOptions?: { mode: 'open' | 'closed' },
  useCSSModule?: boolean,
  _preprocess = preprocess // for testing
) {
  return new Transform({
    objectMode: true,
    transform: function(file: Vinyl, enc, cb) {
      if (file.isStream()) {
        this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
      } else if (file.isBuffer()) {
        const { extname } = file;
        if (extname === '.html' || extname === '.js' || extname === '.ts') {
          // Rewrite foo.html to foo.html.js
          // Don't wrap css module id when using CSSModule
          const result = _preprocess(
            file.relative,
            file.contents.toString(),
            file.base,
            shadowOptions,
            useCSSModule ? undefined : stringModuleWrap
          );
          if (extname === '.html') {
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
  return 'text!' + id;
}
