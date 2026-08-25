import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Writable } from 'stream';

export const testBuildCommand = 'npm run dev:tsc';
export const nodeTestCommand = 'node z-scripts/run-node-tests.cjs --watch';
export const browserTestCommand = 'node z-scripts/run-browser-tests.cjs';

export interface TestCommandConfig {
  readonly buildCommand: string;
  readonly runCommand: string;
  readonly env: {
    readonly AURELIA_TEST_PATTERNS: string;
    readonly AURELIA_TEST_BUILD_TOKEN: string;
    readonly AURELIA_TEST_WATCH_ROOTS: string;
  };
}

export interface DevProcessGroup {
  readonly commands: readonly { kill(): void }[];
  readonly result: Promise<unknown>;
}

export function createTestCommandConfig(
  patterns: readonly string[],
  nodeTests: boolean,
  watchRoots: readonly string[],
  buildToken: string,
): TestCommandConfig {
  return {
    buildCommand: testBuildCommand,
    runCommand: nodeTests ? nodeTestCommand : browserTestCommand,
    // Patterns stay data so spaces, globs, and shell syntax never alter the fixed commands.
    env: {
      AURELIA_TEST_PATTERNS: JSON.stringify(patterns),
      AURELIA_TEST_BUILD_TOKEN: buildToken,
      // The runner watches only packages that this dev invocation is actively rebuilding.
      AURELIA_TEST_WATCH_ROOTS: JSON.stringify(watchRoots),
    },
  };
}

export function createTestBuildToken(): string {
  return `${process.pid}-${randomUUID()}`;
}

export function createDevLogStream(filePath: string, outputStream: Writable = process.stdout): Writable {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `# aurelia dev log\n# started ${new Date().toISOString()}\n\n`);
  return createTeeWritable(outputStream, fs.createWriteStream(filePath, { flags: 'a' }));
}

export function createTeeWritable(outputStream: Writable, fileStream: Writable): Writable {
  return new TeeWritable(outputStream, fileStream);
}

export function closeDevLogStream(stream: Writable | undefined): Promise<void> {
  if (stream === undefined || stream.writableFinished) {
    return Promise.resolve();
  }
  if (stream.errored instanceof Error) {
    return Promise.reject(stream.errored);
  }
  if (stream.destroyed) {
    return Promise.reject(new Error('The development log closed before its output was flushed.'));
  }

  return new Promise((resolve, reject) => {
    const onFinish = () => {
      stream.off('error', onError);
      resolve();
    };
    const onError = (error: Error) => {
      stream.off('finish', onFinish);
      reject(error);
    };

    stream.once('finish', onFinish);
    stream.once('error', onError);
    stream.end();
  });
}

export async function waitForDevProcesses(
  devProcesses: DevProcessGroup,
  logFailure: Promise<Error> | undefined,
): Promise<boolean> {
  const processResult = devProcesses.result.then(
    () => false,
    () => true,
  );
  if (logFailure === undefined) {
    return processResult;
  }

  const firstResult = await Promise.race([
    processResult.then(processFailed => ({ processFailed })),
    logFailure.then(error => ({ error })),
  ]);
  if ('processFailed' in firstResult) {
    return firstResult.processFailed;
  }

  // Let Concurrently tear down each process tree instead of exiting around its signal handling.
  devProcesses.commands.forEach(command => command.kill());
  await processResult;
  return true;
}

class TeeWritable extends Writable {
  public constructor(
    private readonly outputStream: Writable,
    private readonly fileStream: Writable,
  ) {
    super();
    // File errors occur on the inner stream; forwarding them gives the runner one managed failure path.
    this.fileStream.once('error', error => this.destroy(error));
  }

  public override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    let pending = 2;
    let writeError: Error | null | undefined;
    const completed = (error?: Error | null) => {
      writeError ??= error;
      if (--pending === 0) {
        callback(writeError);
      }
    };

    // Waiting for both callbacks makes the outer stream respect the slower destination.
    this.outputStream.write(chunk, completed);
    this.fileStream.write(chunk, completed);
  }

  public override _final(callback: (error?: Error | null) => void): void {
    this.fileStream.end(callback);
  }

  public override _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
    if (!this.fileStream.destroyed) {
      this.fileStream.destroy();
    }
    callback(error);
  }
}
