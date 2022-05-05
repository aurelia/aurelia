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
    node: true,
  },
  rules: {
    'import/no-nodejs-modules': 'off',
    '@typescriot-eslint/strict-boolean-expression': 'off'
  }
};
