/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends:  ['../../.eslintrc.cjs'],
  overrides: [{
    files: ['./**/*.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      'import/no-nodejs-modules': 'off',
      'import/no-extraneous-dependencies': 'off',
    }
  },
    {
    files: ['**/*.spec.ts'],
    rules: {
      'import/no-nodejs-modules': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      'no-await-in-loop': 'off',
      'max-lines-per-function': 'off',
    }
  }]
};
