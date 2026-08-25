import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Writable } from 'stream';
import { describe, it } from 'node:test';
import {
  browserTestCommand,
  closeDevLogStream,
  createDevLogStream,
  createTeeWritable,
  createTestBuildToken,
  createTestCommandConfig,
  nodeTestCommand,
  testBuildCommand,
  waitForDevProcesses,
} from './dev-utils';

void describe('development script utilities', () => {
  void it('keeps raw test patterns out of shell commands', () => {
    const patterns = [
      '3-runtime/a test',
      '$(touch injected)',
      '" && unexpected-command',
      'path\\with\\backslashes',
    ];
    const watchRoots = ['packages/kernel/dist', 'packages/runtime/dist'];

    const nodeConfig = createTestCommandConfig(patterns, true, watchRoots, 'node-build');
    const browserConfig = createTestCommandConfig(patterns, false, watchRoots, 'browser-build');

    assert.equal(nodeConfig.buildCommand, testBuildCommand);
    assert.equal(nodeConfig.runCommand, nodeTestCommand);
    assert.equal(browserConfig.buildCommand, testBuildCommand);
    assert.equal(browserConfig.runCommand, browserTestCommand);
    assert.deepEqual(JSON.parse(nodeConfig.env.AURELIA_TEST_PATTERNS), patterns);
    assert.deepEqual(JSON.parse(browserConfig.env.AURELIA_TEST_PATTERNS), patterns);
    assert.equal(nodeConfig.env.AURELIA_TEST_BUILD_TOKEN, 'node-build');
    assert.equal(browserConfig.env.AURELIA_TEST_BUILD_TOKEN, 'browser-build');
    assert.deepEqual(JSON.parse(nodeConfig.env.AURELIA_TEST_WATCH_ROOTS), watchRoots);
    assert.deepEqual(JSON.parse(browserConfig.env.AURELIA_TEST_WATCH_ROOTS), watchRoots);
  });

  void it('creates a fresh compiler handshake token per dev invocation', () => {
    const first = createTestBuildToken();
    const second = createTestBuildToken();
    assert.notEqual(first, second);
    assert.match(first, /^\d+-[0-9a-f-]{36}$/);
  });

  void it('waits for both log destinations before accepting the next chunk', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aurelia-dev-log-'));
    const logFile = path.join(directory, 'dev.log');
    const chunks: string[] = [];
    const callbacks: (() => void)[] = [];
    let notifySecondWrite!: () => void;
    const secondWrite = new Promise<void>(resolve => {
      notifySecondWrite = resolve;
    });
    const delayedOutput = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        chunks.push(chunk.toString());
        callbacks.push(callback);
        if (chunks.length === 2) {
          notifySecondWrite();
        }
      },
    });

    try {
      const stream = createDevLogStream(logFile, delayedOutput);
      stream.write('first');
      stream.write('second');
      const closed = closeDevLogStream(stream);

      assert.deepEqual(chunks, ['first']);
      callbacks.shift()?.();
      await secondWrite;
      assert.deepEqual(chunks, ['first', 'second']);
      callbacks.shift()?.();
      await closed;

      const log = fs.readFileSync(logFile, 'utf8');
      assert.match(log, /# aurelia dev log/);
      assert.ok(log.endsWith('firstsecond'));
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  void it('forwards file write errors through the outer log stream', async () => {
    const expected = new Error('log destination failed');
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    const failingFile = new Writable({
      write() {
        // Destroying the destination emits independently of the tee's write callback.
        failingFile.destroy(expected);
      },
    });
    const stream = createTeeWritable(output, failingFile);
    const error = new Promise<Error>(resolve => stream.once('error', resolve));

    stream.write('content');
    assert.equal(await error, expected);
    assert.equal(stream.destroyed, true);
    await assert.rejects(closeDevLogStream(stream), expected);
  });

  void it('kills every managed command when logging fails', async () => {
    const killed: string[] = [];
    let finishProcesses!: () => void;
    const result = new Promise<void>(resolve => {
      finishProcesses = resolve;
    });
    const kill = (name: string) => () => {
      killed.push(name);
      if (killed.length === 2) {
        finishProcesses();
      }
    };

    const failed = await waitForDevProcesses({
      commands: [{ kill: kill('compiler') }, { kill: kill('tests') }],
      result,
    }, Promise.resolve(new Error('log destination failed')));

    assert.equal(failed, true);
    assert.deepEqual(killed, ['compiler', 'tests']);
  });
});
