module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    tsconfigRootDir: '.',
  },
  rules: {
    'import/no-nodejs-modules': 'off'
  }
};
