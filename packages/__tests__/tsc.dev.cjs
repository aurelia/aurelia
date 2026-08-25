/* eslint-disable */
const { rmSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const ts = require('typescript');
const {
  createTestBuildStatusReporter,
  readTestBuildToken,
  removeOrphanedSpecOutputs,
  removeTestBuildMarker,
  writeTestBuildMarker,
} = require('./z-scripts/test-build-contract.cjs');
const { expandTypeScriptTestIncludes, readTestPatterns } = require('./z-scripts/test-patterns.cjs');

const testPatterns = readTestPatterns(process.argv.slice(2));
const buildToken = readTestBuildToken();
const baseConfig = require('./tsconfig.json');
const configPath = resolve(__dirname, '.tsconfig.dev.json');
const distPath = resolve(__dirname, 'dist');
const config = {
  ...baseConfig,
  compilerOptions: {
    ...baseConfig.compilerOptions,
    composite: false,
    incremental: false,
    tsBuildInfoFile: null,
  },
  include: [
    'assets-modules.d.ts',
    'src/*.ts',
    ...expandTypeScriptTestIncludes(testPatterns),
  ],
  exclude: [
    ...baseConfig.exclude,
    'src/3-runtime/generated',
  ]
};

// A selective watch build must not inherit specs removed or excluded by this invocation.
rmSync(distPath, { recursive: true, force: true });
writeFileSync(configPath, JSON.stringify(config, null, 2));

const formatHost = {
  getCanonicalFileName: file => file,
  getCurrentDirectory: () => process.cwd(),
  getNewLine: () => ts.sys.newLine,
};
const reportDiagnostic = diagnostic => {
  process.stderr.write(ts.formatDiagnostic(diagnostic, formatHost));
};
let currentProgram;
const reportWatchStatus = createTestBuildStatusReporter({
  format: diagnostic => ts.formatDiagnostic(diagnostic, formatHost),
  invalidate: () => {
    if (buildToken !== void 0) {
      removeTestBuildMarker(__dirname);
    }
  },
  markReady: () => {
    if (buildToken !== void 0) {
      removeOrphanedSpecOutputs(
        __dirname,
        currentProgram?.getSourceFiles().map(sourceFile => sourceFile.fileName) ?? [],
      );
      writeTestBuildMarker(__dirname, buildToken);
    }
  },
  startCodes: [
    ts.Diagnostics.Starting_compilation_in_watch_mode.code,
    ts.Diagnostics.File_change_detected_Starting_incremental_compilation.code,
  ],
  successCode: ts.Diagnostics.Found_0_errors_Watching_for_file_changes.code,
  write: message => process.stdout.write(message),
});
const host = ts.createWatchCompilerHost(
  configPath,
  {},
  ts.sys,
  ts.createSemanticDiagnosticsBuilderProgram,
  reportDiagnostic,
  reportWatchStatus,
);
const afterProgramCreate = host.afterProgramCreate;
host.afterProgramCreate = builderProgram => {
  currentProgram = builderProgram.getProgram();
  afterProgramCreate?.(builderProgram);
};
ts.createWatchProgram(host);
