module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:cypress/recommended',
    'plugin:mocha/recommended'
  ],
  env: {
    browser: true,
    node: true,
    mocha: true
  },
  plugins: [
    'mocha'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-nodejs-modules': 'off',
    'jsdoc/require-jsdoc': 'off',
    'mocha/no-async-describe': 'error',
    'mocha/no-hooks-for-single-case': 'off', // Disabled to avoid duplicates, because 'no-hooks' is enabled
    'max-lines-per-function': 'off',
    'no-console': 'off',

    // Things we maybe need to fix some day, so are marked as off for now as they're quite noisy:
    'mocha/max-top-level-suites': 'off',
    'mocha/no-exclusive-tests': 'off',
    'mocha/no-hooks': 'off',
    'mocha/no-identical-title': 'off',
    'mocha/no-mocha-arrows': 'off',
    'mocha/no-return-from-async': 'off',
    'mocha/no-setup-in-describe': 'off',
    'mocha/no-synchronous-tests': 'off',
    'mocha/no-top-level-hooks': 'off'
  }
};
