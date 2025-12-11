module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    // Allow any type for rapid development
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused vars with underscore prefix
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Allow require statements
    '@typescript-eslint/no-var-requires': 'warn',
    // Allow empty functions
    '@typescript-eslint/no-empty-function': 'warn',
    // Allow non-null assertions
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '*.js',
    '*.d.ts',
    'build',
    '.turbo',
  ],
};
