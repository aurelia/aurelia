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
  rules: {
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }],
  }
};
