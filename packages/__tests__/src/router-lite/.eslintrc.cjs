module.exports = {
  extends: ['../../.eslintrc.cjs'],
  overrides: [{ // Specific overrides for JS files as some TS rules don't make sense there.
    files: ['*.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off'
    }
  }]
};
