module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Disable core ESLint rules that conflict with TypeScript
    'no-unused-vars': 'off',
    'camelcase': 'off',
    'indent': 'off',

    // Enable TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'ignoreRestSiblings': false,
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
    }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'variableLike',
        'format': ['camelCase'],
      },
    ],
    '@typescript-eslint/indent': ['error', 2],

    // Your custom rules
    'prefer-const': ['error', {
      'destructuring': 'all',
      'ignoreReadBeforeAssign': true,
    }],
    'no-console': ['warn', {
      'allow': ['warn', 'error'],
    }],
    'quotes': ['error', 'single', {
      'avoidEscape': true,
      'allowTemplateLiterals': true,
    }],
    'semi': ['error', 'always'],
    'arrow-body-style': ['error', 'as-needed'],
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
  },
};

