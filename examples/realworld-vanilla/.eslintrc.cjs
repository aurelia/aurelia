const path = require('path');

module.exports = {
  root: true,
  extends:  [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
  },
  reportUnusedDisableDirectives: true,
};
