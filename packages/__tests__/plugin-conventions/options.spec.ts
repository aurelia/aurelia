import { preprocessOptions } from '@aurelia/plugin-conventions';
import { assert } from '@aurelia/testing';

describe('preprocessOptions', function () {
  it('returns default options', function() {
    assert.deepEqual(
      preprocessOptions(),
      {
        cssExtensions: ['.css', '.less', '.sass', '.scss', '.styl'],
        jsExtensions: ['.coffee', '.js', '.jsx', '.ts', '.tsx'],
        templateExtensions: ['.haml', '.html', '.jade', '.md', '.pug', '.slim', '.slm'],
        stringModuleWrap: undefined
      }
    );
  });

  it('merges optional extensions', function() {
    assert.deepEqual(
      preprocessOptions({
        cssExtensions: ['.css', '.some'],
        jsExtensions: ['.mjs'],
        templateExtensions: ['.markdown']
      }),
      {
        cssExtensions: ['.css', '.less', '.sass', '.scss', '.some', '.styl'],
        jsExtensions: ['.coffee', '.js', '.jsx', '.mjs', '.ts', '.tsx'],
        templateExtensions: ['.haml', '.html', '.jade', '.markdown', '.md', '.pug', '.slim', '.slm'],
        stringModuleWrap: undefined
      }
    );
  });

  it('merges optional options', function() {
    const wrap = (id: string) => `text!${id}`;

    assert.deepEqual(
      preprocessOptions({
        defaultShadowOptions: { mode: 'closed' },
        stringModuleWrap: wrap,
        templateExtensions: ['.markdown'],
        useProcessedFilePairFilename: true,
        useCSSModule: false
      }),
      {
        defaultShadowOptions: { mode: 'closed' },
        cssExtensions: ['.css', '.less', '.sass', '.scss', '.styl'],
        jsExtensions: ['.coffee', '.js', '.jsx', '.ts', '.tsx'],
        templateExtensions: ['.haml', '.html', '.jade','.markdown', '.md', '.pug', '.slim', '.slm'],
        stringModuleWrap: wrap,
        useProcessedFilePairFilename: true
      }
    );
  });

  it('merges optional options, turn off stringModuleWrap if uses CSSModule', function() {
    const wrap = (id: string) => `text!${id}`;

    assert.deepEqual(
      preprocessOptions({
        cssExtensions: ['.some'],
        defaultShadowOptions: { mode: 'open' },
        stringModuleWrap: wrap,
        useProcessedFilePairFilename: true,
        useCSSModule: true
      }),
      {
        defaultShadowOptions: { mode: 'open' },
        cssExtensions: ['.css', '.less', '.sass', '.scss', '.some', '.styl'],
        jsExtensions: ['.coffee', '.js', '.jsx', '.ts', '.tsx'],
        templateExtensions: ['.haml', '.html', '.jade', '.md', '.pug', '.slim', '.slm'],
        stringModuleWrap: undefined,
        useProcessedFilePairFilename: true
      }
    );
  });
});
