module.exports = {
  extends: [
    '../../.eslintrc.js',
  ],
  parserOptions: {
    tsconfigRootDir: '.',
  },
  env: {
    node: true,
  },
  rules: {
    'import/no-nodejs-modules': 'off', // nodejs modules are a key part of a CLI
    'jsdoc/require-jsdoc': 'off', // the CLI is not programmatic public API
    'no-console': 'off', // console is a key part of a CLI
  },
  overrides: [
    {
      files: ['bin/au.js'],
      rules: {
        'import/no-unassigned-import': 'off',
      },
    },
  ],
};
