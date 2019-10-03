module.exports = {
  parser:  '@typescript-eslint/parser',
  root: true,
  extends:  [
    'eslint:recommended',
    'plugin:jsdoc/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
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
    'security',
    'sonarjs'
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    // Opinionated overrides of the default recommended rules:
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-inferrable-types': 'off', // Turn no-inferrable-types off in order to make the code consistent in its use of type decorations.
    'security/detect-object-injection': 'off',
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-identical-functions': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'no-dupe-class-members': 'off',

    // Opinionated non default rules:
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/ban-types': ['warn', {
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
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/member-ordering': ['error', { default: ['field'] }],
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/semi': 'error',
    '@typescript-eslint/triple-slash-reference': ['error', { path: 'never', types: 'always', lib: 'never' }],
    'new-parens': ['error', 'always'],
    'no-caller': 'error',
    'no-constant-condition': 'error',
    'no-eval': 'error',
    'no-extra-bind': 'error',
    'no-import-assign': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
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
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'prefer-object-spread': 'error',
    'prefer-regex-literals': 'error',
    'quote-props': ['error', 'consistent'],
    'quotes': ['off'],
    'radix': 'error',
    'space-in-parens': 'error',

    // Things we maybe need to fix some day, so are marked as warnings for now:
    '@typescript-eslint/array-type': 'warn',
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/camelcase': 'warn',
    '@typescript-eslint/class-name-casing': 'warn',
    '@typescript-eslint/consistent-type-assertions': ['warn', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/member-delimiter-style': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-namespace': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-parameter-properties': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    // '@typescript-eslint/quotes': ['warn', 'backtick', { avoidEscape: true }],
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/type-annotation-spacing': 'warn',
    '@typescript-eslint/typedef': ['warn', { arrowParameter: false, parameter: false, variableDeclaration: false }],
    'compat/compat': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-absolute-path': 'warn',
    'import/no-deprecated': 'warn',
    'import/no-default-export': 'warn',
    'import/no-extraneous-dependencies': ['warn', { devDependencies: false, optionalDependencies: false, peerDependencies: false}],
    'import/no-mutable-exports': 'warn',
    'import/no-unassigned-import': 'warn',
    'import/no-useless-path-segments': ['warn', { noUselessIndex: true }],
    'import/order': ['warn', { 'newlines-between': 'never' }],
    'jsdoc/check-alignment': 'warn',
    'jsdoc/check-examples': 'warn',
    'jsdoc/check-indentation': 'warn',
    'jsdoc/check-param-names': 'warn',
    'jsdoc/check-syntax': 'warn',
    'jsdoc/check-tag-names': 'warn',
    'jsdoc/match-description': 'warn',
    'jsdoc/newline-after-description': 'warn',
    'jsdoc/no-types': 'warn',
    'jsdoc/require-description': 'warn',
    'jsdoc/require-example': 'warn',
    'jsdoc/require-hyphen-before-param-description': 'warn',
    // 'jsdoc/require-jsdoc': 'warn',
    'jsdoc/require-param': 'warn',
    'jsdoc/require-param-type': 'warn',
    'jsdoc/require-returns': 'warn',
    'jsdoc/require-returns-type': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-unsafe-regex': 'warn',
    'sonarjs/no-all-duplicated-branches': 'warn',
    'sonarjs/no-duplicated-branches': 'warn',
    'sonarjs/no-extra-arguments': 'warn',
    'sonarjs/no-inverted-boolean-check': 'warn',
    'sonarjs/no-small-switch': 'warn',
    'sonarjs/no-useless-catch': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'default-param-last': ['warn'],
    'eqeqeq': 'warn',
    'eol-last': ['warn', 'always'],
    'function-call-argument-newline': ['warn', 'consistent'],
    'max-lines-per-function': ['warn', 200],
    'no-case-declarations': 'warn',
    'no-cond-assign': 'warn',
    'no-console': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-extra-semi': 'warn',
    'no-fallthrough': 'warn',
    'no-inner-declarations': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-prototype-builtins': 'warn',
    'no-useless-escape': 'warn',
    'no-unused-expressions': 'warn',
    'no-useless-catch': 'warn',
    'no-shadow': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-trailing-spaces': 'warn',
    'no-undef': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'require-atomic-updates': 'warn',
    'spaced-comment': ['warn', 'always', {
      line: { markers: ['/'], exceptions: ['-', '+'] },
      block: { markers: ['!'], exceptions: ['*'], balanced: true }
    }],

    // Off for now as they create way to much noise
    '@typescript-eslint/quotes': ['off'],
    'jsdoc/require-jsdoc': 'off'
  },
  overrides: [{ // Specific overrides for JS files as some TS rules don't make sense there.
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }, { // Specific overrides for TS files within tests as some rules don't make sense there.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }],
  settings: {
    polyfills: [
      'fetch',
      'Reflect'
    ]
  }
};
