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
    browser: true,
  },
  rules: {
    'default-param-last': 'off',
    'no-console': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
  }
};
