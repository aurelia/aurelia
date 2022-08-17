const path = require('path');
const thisDir = path.resolve(__dirname);

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: [
    '../../.eslintrc.cjs',
  ],
  parserOptions: {
    project: path.join(thisDir, 'tsconfig.json'),
    tsconfigRootDir: thisDir,
  },
  overrides: [{
    files: '**/*.ts',
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off'
    }
  }]
};
