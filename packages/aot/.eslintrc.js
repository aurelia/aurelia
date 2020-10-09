module.exports = {
  extends: [
    '../../.eslintrc.js',
  ],
  env: {
    node: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/require-await': 'off', // false positives
    '@typescript-eslint/promise-function-async': 'off', // perf consideration
    'no-constant-condition': 'off', // necessary construct for spec compliance
    '@typescript-eslint/strict-boolean-expressions': 'off', // false positives in null coalescing
    '@typescript-eslint/brace-style': 'off', // needed for spec steps readability sometimes
    '@typescript-eslint/no-unnecessary-type-assertion': 'off', // too much noise for non-null operator
    '@typescript-eslint/no-this-alias': 'off', // needed for spec readability
    '@typescript-eslint/indent': 'off', // deviation often needed for spec step comments
    'no-irregular-whitespace': 'off', // doesn't make sense
    'sonarjs/prefer-immediate-return': 'off', // need temporary variables for debugging
    'sonarjs/no-collapsible-if': 'off', // necessary for spec steps readability
    'compat/compat': 'off',
    'import/no-nodejs-modules': 'off',
    'jsdoc/require-jsdoc': 'off',
    'max-lines-per-function': 'off',
    'no-console': 'off',
  },
};
