'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it } = require('node:test');
const FileList = require('karma/lib/file-list');

describe('coordinated Karma file refresh', () => {
  it('re-globs added and removed specs and serves current files uncached', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurelia-karma-refresh-'));
    const previous = path.join(root, 'router', 'previous.spec.js');
    const added = path.join(root, 'router', 'added.spec.js');
    fs.mkdirSync(path.dirname(previous), { recursive: true });
    fs.writeFileSync(previous, '');
    const emitter = new EventEmitter();
    let modifications = 0;
    emitter.on('file_list_modified', () => modifications++);
    const fileList = new FileList([{
      pattern: path.join(root, '**', '*.spec.js'),
      served: true,
      included: true,
      watched: false,
      nocache: true,
      type: 'module',
    }], [], emitter, async () => {}, 0);

    try {
      await fileList.refresh();
      assert.deepEqual(includedNames(fileList, root), ['router/previous.spec.js']);
      assert.equal(fileList.files.included[0].doNotCache, true);

      fs.rmSync(previous);
      fs.writeFileSync(added, '');
      await fileList.refresh();

      assert.deepEqual(includedNames(fileList, root), ['router/added.spec.js']);
      assert.equal(fileList.files.included[0].doNotCache, true);
      assert.equal(modifications, 2);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

function includedNames(fileList, root) {
  return fileList.files.included
    .map(file => path.relative(root, file.originalPath).replace(/\\/g, '/'))
    .sort();
}
