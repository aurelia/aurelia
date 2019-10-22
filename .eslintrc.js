module.exports = {
  parser:  '@typescript-eslint/parser',
  root: true,
  extends:  [
    'eslint:recommended',
    'plugin:jsdoc/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:sonarjs/recommended',
    'plugin:import/typescript'
  ],
  parserOptions: {
    ecmaVersion: 2019,
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: '.'
  },
  env: {
    es6: true
  },
  globals: {
    MutationObserver: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  plugins: [
    'compat',
    'import',
    'jsdoc',
    'sonarjs'
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    // Opinionated overrides of the default recommended rules:
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-inferrable-types': 'off', // Turn no-inferrable-types off in order to make the code consistent in its use of type decorations.
    '@typescript-eslint/no-non-null-assertion': 'off',
    'security/detect-object-injection': 'off',
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-identical-functions': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'no-dupe-class-members': 'off',

    // Opinionated non default rules:
    '@typescript-eslint/camelcase': 'error',
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/ban-types': ['error', {
      'types': {
        '{}': 'Avoid using the `{}` type. Prefer a specific lookup type, like `Record<string, unknown>`, or use `object` (lowercase) when referring simply to non-primitives.',
        Function: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`, or use `Constructable` / `Class<TProto, TStatic>` when referring to a constructor function.',
        Boolean: { message: 'Use boolean instead', fixWith: 'boolean' },
        Number: { message: 'Use number instead', fixWith: 'number' },
        String: { message: 'Use string instead', fixWith: 'string' },
        Object: { message: 'Use Record<string, unknown> instead', fixWith: 'Record<string, unknown>' },
        Symbol: { message: 'Use symbol instead', fixWith: 'symbol' }
      }
    }],
    '@typescript-eslint/class-name-casing': 'error',
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/member-ordering': ['error', { default: ['field'] }],
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/semi': 'error',
    '@typescript-eslint/triple-slash-reference': ['error', { path: 'never', types: 'always', lib: 'never' }],
    '@typescript-eslint/type-annotation-spacing': 'error',
    'compat/compat': 'warn',
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
    'import/order': ['error', { 'groups': [], 'newlines-between': 'never' }],
    'import/no-deprecated': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/check-tag-names': ['error', {
      definedTags: [
        'chainable',
        'internal',
        // JSDoc gets confused about decorators, so add them as exclusions here
        // for now. Adding parenthesis to differentiate them from JSDoc tags.
        // https://github.com/gajus/eslint-plugin-jsdoc/issues/395
        'transient()',
        'singleton()'
      ]
    }],
    'jsdoc/check-syntax': 'error',
    'jsdoc/newline-after-description': 'error',
    'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
    'sonarjs/no-useless-catch': 'error',
    'eol-last': ['error', 'always'],
    'function-call-argument-newline': ['error', 'consistent'],
    'max-lines-per-function': ['error', 200],
    'new-parens': ['error', 'always'],
    'no-caller': 'error',
    'no-case-declarations': 'error',
    'no-constant-condition': 'error',
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
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-unused-expressions': 'error',
    'no-useless-catch': 'error',
    'no-useless-escape': 'error',
    'no-trailing-spaces': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-object-spread': 'error',
    'prefer-regex-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'quote-props': ['error', 'consistent'],
    'quotes': ['off'],
    'radix': 'error',
    'space-in-parens': 'error',
    'spaced-comment': ['error', 'always', {
      line: { markers: ['/'], exceptions: ['-', '+'] },
      block: { markers: ['!'], exceptions: ['*'], balanced: true }
    }],

    // Things we maybe need to fix some day, so are marked as warnings for now:
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-use-before-define': 'off',
    // '@typescript-eslint/quotes': ['warn', 'backtick', { avoidEscape: true }],
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/typedef': ['warn', { arrowParameter: false, parameter: false, variableDeclaration: false }],
    '@typescript-eslint/unbound-method': 'warn',
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
    'sonarjs/no-all-duplicated-branches': 'warn',
    'sonarjs/no-duplicated-branches': 'warn',
    'sonarjs/no-extra-arguments': 'warn',
    'sonarjs/no-inverted-boolean-check': 'warn',
    'sonarjs/no-small-switch': 'off',
    'sonarjs/prefer-immediate-return': 'warn',
    'default-param-last': ['warn'],
    'eqeqeq': 'warn',
    'no-await-in-loop': 'warn',
    'no-cond-assign': 'warn',
    'no-console': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-fallthrough': 'warn',
    'no-inner-declarations': 'warn',
    'no-shadow': 'warn',
    'no-undef': 'warn',
    'require-atomic-updates': 'warn',

    // Off for now as they create way to much noise
    '@typescript-eslint/quotes': ['off']
  },
  overrides: [{ // Specific overrides for JS files as some TS rules don't make sense there.
    files: ['**/*.js', 'examples/jit-parcel-ts/**'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/typedef': 'off',
      'compat/compat': 'off'
    }
  }, { // Specific overrides for TS files within examples, scripts and tests as some rules don't make sense there.
    files: ['examples/**', 'scripts/**', 'test/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'compat/compat': 'off',
      'import/no-nodejs-modules': 'off'
    }
  }],
  settings: {
    polyfills: [
      'fetch',
      'Reflect'
    ]
  }
};
