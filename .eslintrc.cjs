const path = require('path');
const thisDir = path.resolve(__dirname);

module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  extends:  [
    'eslint:recommended',
    'plugin:jsdoc/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/typescript'
  ],
  parserOptions: {
    ecmaVersion: 2019,
    project: path.join(thisDir, 'tsconfig.eslint.json'),
    sourceType: 'module',
    tsconfigRootDir: thisDir,
  },
  env: {
    es6: true
  },
  globals: {
    MutationObserver: 'readonly',
    SharedArrayBuffer: 'readonly',
    Atomics: 'readonly',
    BigInt: 'readonly',
    BigInt64Array: 'readonly',
    BigUint64Array: 'readonly',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'jsdoc',
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    // Opinionated overrides of the default recommended rules:
    '@typescript-eslint/indent': 'off', // Disabled until typescript-eslint properly fixes indentation (see https://github.com/typescript-eslint/typescript-eslint/issues/1232) - there are recurring issues and breaking changes, and this rule usually isn't violated due to autoformatting anyway.
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-inferrable-types': 'off', // Turn no-inferrable-types off in order to make the code consistent in its use of type decorations.
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'security/detect-object-injection': 'off',
    'no-dupe-class-members': 'off',

    // Opinionated non default rules:
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/ban-types': ['error', {
      'extendDefaults': false,
      'types': {
        // '{}': 'Avoid using the `{}` type. Prefer a specific lookup type, like `Record<string, unknown>`, or use `object` (lowercase) when referring simply to non-primitives.',
        Function: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`, or use `Constructable` / `Class<TProto, TStatic>` when referring to a constructor function.',
        Boolean: { message: 'Use boolean instead', fixWith: 'boolean' },
        Number: { message: 'Use number instead', fixWith: 'number' },
        String: { message: 'Use string instead', fixWith: 'string' },
        Object: { message: 'Use Record<string, unknown> instead', fixWith: 'Record<string, unknown>' },
        Symbol: { message: 'Use symbol instead', fixWith: 'symbol' }
      }
    }],
    '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    '@typescript-eslint/func-call-spacing': ['error', 'never'],
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/member-ordering': ['error', { default: ['signature', 'field'] }],
    '@typescript-eslint/no-dynamic-delete': 'error',
    '@typescript-eslint/no-empty-function': ['error', { 'allow': ['protected-constructors', 'private-constructors'] }],
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/semi': 'error',
    '@typescript-eslint/space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    '@typescript-eslint/triple-slash-reference': ['error', { path: 'never', types: 'always', lib: 'never' }],
    '@typescript-eslint/type-annotation-spacing': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': ['error', 'never', { css: 'always', html: 'always', scss: 'always' }],
    'import/no-absolute-path': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        'examples/**',
        'scripts/**',
        'test/**',
        'gulpfile.js'
      ],
      optionalDependencies: false,
      peerDependencies: false
    }],
    'import/no-mutable-exports': 'error',
    'import/no-nodejs-modules': 'error',
    'import/no-self-import': 'error',
    'import/no-unassigned-import': 'error',
    'import/no-useless-path-segments': ['error'],
    'import/order': ['error', { 'groups': [], 'newlines-between': 'ignore' }],
    'import/no-deprecated': 'off', // this rule is extremely slow (takes 95% of the time of the full lint operation) so we disable it for that reason only
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/check-tag-names': ['error', {
      definedTags: [
        'chainable',
        'internal'
      ]
    }],
    'jsdoc/check-syntax': 'error',
    'jsdoc/newline-after-description': 'error',
    'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
    'array-callback-return': 'error',
    'eol-last': ['error', 'always'],
    'func-call-spacing': 'off', // See @typescript-eslint/func-call-spacing
    'function-call-argument-newline': ['error', 'consistent'],
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
    'max-lines-per-function': ['error', 200],
    'new-parens': ['error', 'always'],
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-constant-condition': 'error',
    'no-dupe-else-if': 'error',
    'no-eval': 'error',
    'no-extra-bind': 'error',
    'no-extra-semi': 'error',
    'no-import-assign': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-prototype-builtins': 'error',
    'no-restricted-properties': ['error',
      { property: 'substr', message: '"substr" is considered a legacy function and should be avoided when possible. Use "substring" instead.' }
    ],
    'no-restricted-syntax': ['error',
      { selector: 'MemberExpression[object.name=\'document\'][property.name=\'cookies\']', message: 'Usage of document.cookies is forbidden.' },
      { selector: 'MemberExpression[object.name=\'document\'][property.name=\'domain\']', message: 'Usage of document.domain is forbidden.' },
      { selector: 'MemberExpression[object.name=\'document\'][property.name=\'write\']', message: 'Usage of document.write is forbidden.' },
      { selector: 'CallExpression[callee.name=\'execScript\']', message: 'Usage of execScript is forbidden.' }
    ],
    'no-return-await': 'error',
    'no-sequences': 'error',
    'no-setter-return': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-unused-expressions': 'off', // See @typescript-eslint/no-unused-expressions
    'no-useless-catch': 'error',
    'no-useless-escape': 'error',
    'no-trailing-spaces': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-exponentiation-operator': 'error',
    'prefer-object-spread': 'error',
    'prefer-regex-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'quote-props': ['error', 'consistent'],
    'quotes': ['off'],
    'radix': 'error',
    'sort-keys': ['off'],
    'space-before-function-paren': 'off', // See @typescript-eslint/space-before-function-paren
    'space-in-parens': 'error',
    'spaced-comment': ['error', 'always', {
      line: { markers: ['/'], exceptions: ['-', '+'] },
      block: { markers: ['!'], exceptions: ['*'], balanced: true }
    }],

    // Things we maybe need to fix some day, so are marked as warnings for now:
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'off', // Only false positives seen so far
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-unused-vars-experimental': 'off', // Off for now, crashes eslint
    '@typescript-eslint/prefer-nullish-coalescing': ['warn', { 'forceSuggestionFixer': true }],
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/require-await': 'off',
    // '@typescript-eslint/quotes': ['warn', 'backtick', { avoidEscape: true }],
    '@typescript-eslint/require-array-sort-compare': 'warn',
    '@typescript-eslint/restrict-plus-operands': ['warn', { 'checkCompoundAssignments': true }],
    '@typescript-eslint/restrict-template-expressions': ['warn', { 'allowNumber': true, 'allowBoolean': true, 'allowNullable': false }],
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/typedef': ['warn', { arrowParameter: false, parameter: false, variableDeclaration: false }],
    '@typescript-eslint/unbound-method': 'off', // Only false positives seen so far
    'jsdoc/check-examples': 'off',
    'jsdoc/check-param-names': 'off',
    'jsdoc/match-description': 'off',
    'jsdoc/no-types': 'off',
    'jsdoc/require-description': 'off',
    'jsdoc/require-example': 'off',
    'jsdoc/require-jsdoc': 'off',
    'jsdoc/require-param': 'off',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-returns': 'off',
    'jsdoc/require-returns-type': 'off',
    'default-param-last': ['warn'],
    'eqeqeq': ['warn', 'smart'],
    'no-await-in-loop': 'warn',
    'no-cond-assign': 'warn',
    'no-console': 'warn',
    'no-constructor-return':'warn',
    'no-extra-boolean-cast': 'warn',
    'no-fallthrough': 'warn',
    'no-inner-declarations': 'warn',
    'no-shadow': 'off', // using @typescript-eslint/no-shadow instead
    'no-useless-computed-key': ['warn', { 'enforceForClassMembers': true }],
    'no-undef': 'off', // let typescript take care of this instead
    'require-atomic-updates': 'warn',

    // Off for now as they create way to much noise
    '@typescript-eslint/quotes': ['off']
  },
  overrides: [{ // Specific overrides for JS files as some TS rules don't make sense there.
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/typedef': 'off',
      'import/no-nodejs-modules': 'off',
    }
  }, { // Specific overrides for TS files within examples, scripts and tests as some rules don't make sense there.
    files: ['examples/**', 'scripts/**', 'test/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-nodejs-modules': 'off',
      'import/no-extraneous-dependencies': 'off',
    }
  }],
};
