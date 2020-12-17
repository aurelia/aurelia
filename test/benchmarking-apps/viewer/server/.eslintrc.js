module.exports = {
  extends: ['../../../../.eslintrc.js'],
  parserOptions: {
    tsconfigRootDir: '.',
  },
  env: {
    node: true,
  },
  rules: {
    'import/no-nodejs-modules': 'off'
  }
};
