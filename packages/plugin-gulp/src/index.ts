import { Transform } from 'stream';
import * as Vinyl from 'vinyl';
import * as fs from 'fs';
import { preprocessResource, preprocessHtmlTemplate } from '@aurelia/plugin-conventions';

export default function(opts: any = {}) {
  const ts = !!opts.ts;
  return plugin(ts);
}

export function plugin(
  ts: boolean = false,
  _fileExists = fileExists // for testing
) {
  return new Transform({
    objectMode: true,
    transform: function(file: Vinyl, enc, cb) {
      if (file.isStream()) {
        this.emit('error', new Error('@aurelia/plugin-gulp: Streaming is not supported'));
      } else if (file.isBuffer()) {
        const { extname } = file;
        let result;
        if (extname === '.html') {
          // Rewrite foo.html to foo.html.js
          result = preprocessHtmlTemplate(file.relative, file.contents.toString(), ts);
          file.basename += '.js';
        } else if (extname === '.js' || extname === '.ts') {
          const htmlFilePath = file.path.slice(0, -3) + '.html';
          const hasHtmlPair = _fileExists(htmlFilePath);
          result = preprocessResource(file.relative, file.contents.toString(), hasHtmlPair);
        }

        if (result) {
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

function fileExists(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (e) {
    return false;
  }
}
