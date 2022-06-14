// @ts-check

// If won't use `@ts-check` - just remove that comments (with `@type` JSDoc below).

/** @type import('dts-bundle-generator/config-schema').OutputOptions */
const commonOutputParams = {
  inlineDeclareGlobals: false,
  // sortNodes: true,  
};

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
  compilationOptions: {
    preferredConfigPath: './tsconfig.json',
    followSymlinks: false,
  },

  entries: [
    {
      filePath: './src/index.ts',
      outFile: './dist/types/index.d.ts',
      noCheck: true,
      // failOnClass: true,
      libraries: {
        allowedTypesLibraries: [],
        importedLibraries: ['@aurelia/runtime', '@aurelia/kernel'],
        inlinedLibraries: []
      },

      output: {
        inlineDeclareExternals: false,
        inlineDeclareGlobals: false,
      },
    },
  ],
};

module.exports = config;
