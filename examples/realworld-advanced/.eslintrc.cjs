const path = require('path');
const thisDir = path.resolve(__dirname);

module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  extends:  [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    project: path.join(thisDir, 'tsconfig.eslint.json'),
    sourceType: 'module',
    tsconfigRootDir: thisDir,
  },
  env: {
    es6: true,
    browser: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
  },
};
