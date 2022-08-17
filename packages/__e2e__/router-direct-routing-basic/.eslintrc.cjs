/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends:  ['../../../.eslintrc.cjs'],
  overrides: [{
    files: ['**/*.spec.ts'],
    rules: {
      'import/no-nodejs-modules': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }]
};
