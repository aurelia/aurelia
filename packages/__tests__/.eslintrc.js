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
    'jsdoc/require-jsdoc': 'off',
    'mocha/no-hooks-for-single-case': 'off', // Disabled to avoid duplicates, because 'no-hooks' is enabled
    'max-lines-per-function': 'off',
    'no-console': 'off',

    // Things we maybe need to fix some day, so are marked as warnings for now:
    'import/no-extraneous-dependencies': ['warn', { devDependencies: true, optionalDependencies: false, peerDependencies: false}],
    'mocha/max-top-level-suites': 'warn',
    'mocha/no-async-describe': 'warn',
    'mocha/no-exclusive-tests': 'warn',
    'mocha/no-hooks': 'warn',
    'mocha/no-identical-title': 'warn',
    'mocha/no-mocha-arrows': 'warn',
    'mocha/no-return-from-async': 'warn',
    'mocha/no-setup-in-describe': 'warn',
    'mocha/no-synchronous-tests': 'warn',
    'mocha/no-top-level-hooks': 'warn'
  }
};
