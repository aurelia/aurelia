module.exports = {
  extends: [
    '../../.eslintrc.js'
  ],
  parserOptions: {
    tsconfigRootDir: '.',
  },
  env: {
    es6: true,
    browser: true,
  },
  globals: {
    globalThis: 'readonly',
  },
};
