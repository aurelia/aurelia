module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:mocha/recommended'
  ],
  parserOptions: {
    tsconfigRootDir: '.',
  },
  env: {
    browser: true,
    mocha: true,
  },
  plugins: [
    'mocha',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-nodejs-modules': 'off',
    'jsdoc/require-jsdoc': 'off',
    'mocha/no-exports': 'off',
    'mocha/no-async-describe': 'error',
    'mocha/no-exclusive-tests': 'warn',
    'mocha/no-hooks': 'error',
    'mocha/no-hooks-for-single-case': 'off', // Disabled to avoid duplicates, because 'no-hooks' is enabled
    'mocha/no-identical-title': 'error',
    'mocha/no-mocha-arrows': 'error',
    'mocha/no-return-from-async': 'error',
    'mocha/no-top-level-hooks': 'error',
    'max-lines-per-function': 'off',
    'no-console': 'off',
    'no-useless-catch': 'off',

    // Things we maybe need to fix some day, so are marked as off for now as they're quite noisy:
    'mocha/max-top-level-suites': 'off',
    'mocha/no-setup-in-describe': 'off',
    'mocha/no-synchronous-tests': 'off'
  },
  overrides: [{ // Specific overrides for JS files as some TS rules don't make sense there.
    files: ['3-runtime-html/generated/**'],
    rules: {
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/indent': 'off',
      'no-template-curly-in-string': 'off'
    }
  }]
};
