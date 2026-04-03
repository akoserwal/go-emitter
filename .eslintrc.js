module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // Turn off base rule for TypeScript
  },
  ignorePatterns: [
    'dist/',
    'tmp/',
    'node_modules/',
    '*.go',
    '*.tsp',
  ],
};