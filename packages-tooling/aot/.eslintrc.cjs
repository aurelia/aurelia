const path = require('path');
const thisDir = path.resolve(__dirname);

module.exports = {
  extends: [
    '../../.eslintrc.cjs',
  ],
  parserOptions: {
    project: path.join(thisDir, 'tsconfig.json'),
    tsconfigRootDir: thisDir,
  },
  env: {
    node: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/promise-function-async': 'off', // perf consideration
    'no-constant-condition': 'off', // necessary construct for spec compliance
    '@typescript-eslint/strict-boolean-expressions': 'off', // false positives in null coalescing
    '@typescript-eslint/brace-style': 'off', // needed for spec steps readability sometimes
    '@typescript-eslint/no-unnecessary-type-assertion': 'off', // too much noise for non-null operator
    '@typescript-eslint/no-this-alias': 'off', // needed for spec readability
    '@typescript-eslint/indent': 'off', // deviation often needed for spec step comments
    'no-irregular-whitespace': 'off', // doesn't make sense
    'import/no-nodejs-modules': 'off',
    'jsdoc/require-jsdoc': 'off',
    'max-lines-per-function': 'off',
    'no-console': 'off',
  },
};
