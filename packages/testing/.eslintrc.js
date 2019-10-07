module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    // Significant portion of this code is copy-pasted from the node.js source,
    // therefore we specifically switch off these rule(s) as it's not really "our code"
    // and as a result doesn't have to strictly meet our linting requirements.
    '@typescript-eslint/camelcase': 'off'
  }
};
